// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

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
        "status": "ready"
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_launcher_metadata])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
