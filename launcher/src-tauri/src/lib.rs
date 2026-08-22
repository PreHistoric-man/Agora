// Agora Launcher Native Rust Core (Tauri 2)
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct RuntimeInfo {
    pub name: String,
    pub version: String,
    pub tauri_version: String,
    pub os: String,
    pub arch: String,
    pub status: String,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Welcome to Agora Launcher, {}!", name)
}

#[tauri::command]
fn get_launcher_metadata() -> serde_json::Value {
    serde_json::json!({
        "name": "Agora Launcher",
        "version": "0.1.0",
        "identifier": "com.agora.launcher",
        "description": "Desktop AI Model Hub & Orchestrator",
        "framework": "Tauri 2",
        "runtime_support": ["ollama", "vllm", "modal", "aws"],
        "status": "ready"
    })
}

#[tauri::command]
fn get_runtime_info() -> RuntimeInfo {
    RuntimeInfo {
        name: "Agora Desktop Runtime Engine".to_string(),
        version: "0.1.0".to_string(),
        tauri_version: "2.0".to_string(),
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        status: "active".to_string(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_launcher_metadata,
            get_runtime_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
