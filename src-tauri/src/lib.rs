mod commands;
mod db;
mod models;

use commands::library::DbState;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data directory");
            let db_path = app_data_dir.join("library.db");
            let conn = db::open(&db_path).expect("failed to open database");
            app.manage(DbState(Mutex::new(conn)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::files::pick_audio_files,
            commands::files::scan_folder,
            commands::files::pick_folder,
            commands::files::read_file_bytes,
            commands::library::save_track,
            commands::library::get_library,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
