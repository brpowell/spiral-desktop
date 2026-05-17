use crate::db;
use crate::models::{Track, TrackInput};
use std::sync::Mutex;
use tauri::State;

pub struct DbState(pub Mutex<rusqlite::Connection>);

#[tauri::command]
pub fn save_track(state: State<DbState>, track: TrackInput) -> Result<i64, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    db::save_track(&conn, &track).map_err(|e| {
        eprintln!("save_track error: {e}");
        e.to_string()
    })
}

#[tauri::command]
pub fn get_library(state: State<DbState>) -> Result<Vec<Track>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    db::get_all_tracks(&conn).map_err(|e| {
        eprintln!("get_library error: {e}");
        e.to_string()
    })
}
