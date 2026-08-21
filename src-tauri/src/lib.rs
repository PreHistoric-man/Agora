use serde::{Deserialize, Serialize};
use std::time::Duration;

const DEFAULT_OLLAMA_ENDPOINT: &str = "http://127.0.0.1:11434";

#[derive(Debug, Serialize, Deserialize)]
pub struct AppInfo {
    pub name: String,
    pub product: String,
    pub version: String,
    pub identifier: String,
    pub status: String,
    pub platform: String,
    pub runtime_engine_ready: bool,
    pub default_model_path: String,
    pub supported_runtimes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OllamaModelDetails {
    pub parent_model: Option<String>,
    pub format: Option<String>,
    pub family: Option<String>,
    pub families: Option<Vec<String>>,
    pub parameter_size: Option<String>,
    pub quantization_level: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OllamaModelInfo {
    pub name: String,
    pub model: String,
    pub modified_at: Option<String>,
    pub size: u64,
    pub digest: String,
    pub details: Option<OllamaModelDetails>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OllamaRunningModel {
    pub name: String,
    pub model: String,
    pub size: u64,
    pub digest: String,
    pub details: Option<OllamaModelDetails>,
    pub expires_at: Option<String>,
    pub size_vram: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OllamaStatus {
    pub available: bool,
    pub version: Option<String>,
    pub endpoint: String,
    pub error: Option<String>,
    pub models_count: usize,
    pub running_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OllamaModelStatusResult {
    pub model_tag: String,
    pub installed: bool,
    pub running: bool,
    pub size: Option<u64>,
    pub digest: Option<String>,
    pub modified_at: Option<String>,
    pub expires_at: Option<String>,
    pub size_vram: Option<u64>,
    pub parameter_size: Option<String>,
    pub quantization_level: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ActionResult {
    pub success: bool,
    pub message: String,
    pub error: Option<String>,
}

// Internal raw responses from Ollama HTTP API
#[derive(Deserialize)]
struct RawVersionResponse {
    version: Option<String>,
}

#[derive(Deserialize)]
struct RawTagsResponse {
    models: Option<Vec<OllamaModelInfo>>,
}

#[derive(Deserialize)]
struct RawPsResponse {
    models: Option<Vec<OllamaRunningModel>>,
}

fn sanitize_endpoint(endpoint: Option<String>) -> String {
    endpoint
        .filter(|e| !e.trim().is_empty())
        .unwrap_or_else(|| DEFAULT_OLLAMA_ENDPOINT.to_string())
        .trim_end_matches('/')
        .to_string()
}

#[tauri::command]
fn get_app_info() -> AppInfo {
    AppInfo {
        name: "Agora".to_string(),
        product: "Agora Launcher".to_string(),
        version: "0.2.0".to_string(),
        identifier: "com.agora.launcher".to_string(),
        status: "ready".to_string(),
        platform: std::env::consts::OS.to_string(),
        runtime_engine_ready: true,
        default_model_path: "~/.agora/models".to_string(),
        supported_runtimes: vec!["ollama".to_string()],
    }
}

#[tauri::command]
async fn check_ollama(endpoint: Option<String>) -> Result<OllamaStatus, String> {
    let ep = sanitize_endpoint(endpoint);
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(3))
        .build()
        .map_err(|e| e.to_string())?;

    // Try fetching /api/version
    let version_url = format!("{}/api/version", ep);
    let version_res = client.get(&version_url).send().await;

    match version_res {
        Ok(res) if res.status().is_success() => {
            let ver_json = res.json::<RawVersionResponse>().await.ok();
            let version = ver_json.and_then(|v| v.version).unwrap_or_else(|| "unknown".to_string());

            // Also check models count and running count
            let tags_url = format!("{}/api/tags", ep);
            let models_count = if let Ok(tags_res) = client.get(&tags_url).send().await {
                if let Ok(raw_tags) = tags_res.json::<RawTagsResponse>().await {
                    raw_tags.models.map(|m| m.len()).unwrap_or(0)
                } else {
                    0
                }
            } else {
                0
            };

            let ps_url = format!("{}/api/ps", ep);
            let running_count = if let Ok(ps_res) = client.get(&ps_url).send().await {
                if let Ok(raw_ps) = ps_res.json::<RawPsResponse>().await {
                    raw_ps.models.map(|m| m.len()).unwrap_or(0)
                } else {
                    0
                }
            } else {
                0
            };

            Ok(OllamaStatus {
                available: true,
                version: Some(version),
                endpoint: ep,
                error: None,
                models_count,
                running_count,
            })
        }
        Ok(res) => Ok(OllamaStatus {
            available: false,
            version: None,
            endpoint: ep,
            error: Some(format!("Ollama server returned HTTP {}", res.status())),
            models_count: 0,
            running_count: 0,
        }),
        Err(e) => Ok(OllamaStatus {
            available: false,
            version: None,
            endpoint: ep,
            error: Some(format!("Could not connect to Ollama runtime: {}", e)),
            models_count: 0,
            running_count: 0,
        }),
    }
}

#[tauri::command]
async fn list_ollama_models(endpoint: Option<String>) -> Result<Vec<OllamaModelInfo>, String> {
    let ep = sanitize_endpoint(endpoint);
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(5))
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!("{}/api/tags", ep);
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to connect to Ollama: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Ollama error: HTTP {}", response.status()));
    }

    let parsed = response
        .json::<RawTagsResponse>()
        .await
        .map_err(|e| format!("Failed to parse Ollama model list: {}", e))?;

    Ok(parsed.models.unwrap_or_default())
}

#[tauri::command]
async fn get_ollama_running_models(endpoint: Option<String>) -> Result<Vec<OllamaRunningModel>, String> {
    let ep = sanitize_endpoint(endpoint);
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(5))
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!("{}/api/ps", ep);
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to connect to Ollama: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Ollama error: HTTP {}", response.status()));
    }

    let parsed = response
        .json::<RawPsResponse>()
        .await
        .map_err(|e| format!("Failed to parse Ollama running list: {}", e))?;

    Ok(parsed.models.unwrap_or_default())
}

#[tauri::command]
async fn get_ollama_model_status(
    model_tag: String,
    endpoint: Option<String>,
) -> Result<OllamaModelStatusResult, String> {
    let ep = sanitize_endpoint(endpoint);
    let tag = model_tag.trim().to_lowercase();
    let tag_with_latest = if !tag.contains(':') {
        format!("{}:latest", tag)
    } else {
        tag.clone()
    };

    let installed_models = list_ollama_models(Some(ep.clone())).await.unwrap_or_default();
    let running_models = get_ollama_running_models(Some(ep.clone())).await.unwrap_or_default();

    let matched_installed = installed_models.into_iter().find(|m| {
        let m_name = m.name.to_lowercase();
        let m_model = m.model.to_lowercase();
        m_name == tag || m_name == tag_with_latest || m_model == tag || m_model == tag_with_latest
    });

    let matched_running = running_models.into_iter().find(|m| {
        let m_name = m.name.to_lowercase();
        let m_model = m.model.to_lowercase();
        m_name == tag || m_name == tag_with_latest || m_model == tag || m_model == tag_with_latest
    });

    if let Some(inst) = matched_installed {
        let is_running = matched_running.is_some();
        let size_vram = matched_running.as_ref().and_then(|r| r.size_vram);
        let expires_at = matched_running.and_then(|r| r.expires_at);

        Ok(OllamaModelStatusResult {
            model_tag,
            installed: true,
            running: is_running,
            size: Some(inst.size),
            digest: Some(inst.digest),
            modified_at: inst.modified_at,
            expires_at,
            size_vram,
            parameter_size: inst.details.as_ref().and_then(|d| d.parameter_size.clone()),
            quantization_level: inst.details.as_ref().and_then(|d| d.quantization_level.clone()),
        })
    } else {
        Ok(OllamaModelStatusResult {
            model_tag,
            installed: false,
            running: false,
            size: None,
            digest: None,
            modified_at: None,
            expires_at: None,
            size_vram: None,
            parameter_size: None,
            quantization_level: None,
        })
    }
}

#[tauri::command]
async fn pull_ollama_model(
    model_tag: String,
    endpoint: Option<String>,
) -> Result<ActionResult, String> {
    let ep = sanitize_endpoint(endpoint);
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(600)) // Model downloads can take time
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!("{}/api/pull", ep);
    let payload = serde_json::json!({
        "name": model_tag,
        "stream": false
    });

    let response = client
        .post(&url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Failed to communicate with Ollama pull endpoint: {}", e))?;

    if response.status().is_success() {
        Ok(ActionResult {
            success: true,
            message: format!("Successfully pulled model '{}'", model_tag),
            error: None,
        })
    } else {
        let err_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        Ok(ActionResult {
            success: false,
            message: format!("Failed to pull model '{}'", model_tag),
            error: Some(err_text),
        })
    }
}

#[tauri::command]
async fn run_ollama_model(
    model_tag: String,
    endpoint: Option<String>,
) -> Result<ActionResult, String> {
    let ep = sanitize_endpoint(endpoint);
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(60))
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!("{}/api/generate", ep);
    let payload = serde_json::json!({
        "model": model_tag,
        "prompt": "",
        "keep_alive": "1h"
    });

    let response = client
        .post(&url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Failed to start model '{}': {}", model_tag, e))?;

    if response.status().is_success() {
        Ok(ActionResult {
            success: true,
            message: format!("Model '{}' started successfully", model_tag),
            error: None,
        })
    } else {
        let err_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        Ok(ActionResult {
            success: false,
            message: format!("Failed to start model '{}'", model_tag),
            error: Some(err_text),
        })
    }
}

#[tauri::command]
async fn stop_ollama_model(
    model_tag: String,
    endpoint: Option<String>,
) -> Result<ActionResult, String> {
    let ep = sanitize_endpoint(endpoint);
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .build()
        .map_err(|e| e.to_string())?;

    // In Ollama, unloading a model from memory is done by setting keep_alive to 0
    let url = format!("{}/api/generate", ep);
    let payload = serde_json::json!({
        "model": model_tag,
        "keep_alive": 0
    });

    let response = client
        .post(&url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Failed to stop model '{}': {}", model_tag, e))?;

    if response.status().is_success() {
        Ok(ActionResult {
            success: true,
            message: format!("Model '{}' stopped/unloaded from runtime", model_tag),
            error: None,
        })
    } else {
        let err_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        Ok(ActionResult {
            success: false,
            message: format!("Failed to stop model '{}'", model_tag),
            error: Some(err_text),
        })
    }
}

#[tauri::command]
async fn remove_ollama_model(
    model_tag: String,
    endpoint: Option<String>,
) -> Result<ActionResult, String> {
    let ep = sanitize_endpoint(endpoint);
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(20))
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!("{}/api/delete", ep);
    let payload = serde_json::json!({
        "name": model_tag
    });

    let response = client
        .delete(&url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Failed to remove model '{}': {}", model_tag, e))?;

    if response.status().is_success() {
        Ok(ActionResult {
            success: true,
            message: format!("Model '{}' deleted successfully from local storage", model_tag),
            error: None,
        })
    } else {
        let err_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        Ok(ActionResult {
            success: false,
            message: format!("Failed to remove model '{}'", model_tag),
            error: Some(err_text),
        })
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            check_ollama,
            list_ollama_models,
            get_ollama_running_models,
            get_ollama_model_status,
            pull_ollama_model,
            run_ollama_model,
            stop_ollama_model,
            remove_ollama_model
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
