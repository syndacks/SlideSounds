use once_cell::sync::OnceCell;
use serde_json::Value;
use std::ffi::{c_char, CStr, CString};
use std::sync::Mutex;
use tauri::AppHandle;

extern "C" {
  fn phonics_set_callback(handler: Option<extern "C" fn(*const c_char)>);
  fn phonics_start_listening(expected_json: *const c_char);
  fn phonics_stop_listening();
}

static APP_HANDLE: OnceCell<Mutex<Option<AppHandle>>> = OnceCell::new();

extern "C" fn handle_native_event(json_ptr: *const c_char) {
  if json_ptr.is_null() {
    return;
  }

  let c_str = unsafe { CStr::from_ptr(json_ptr) };
  if let Ok(payload) = c_str.to_str() {
    if let Some(holder) = APP_HANDLE.get() {
      if let Some(app) = holder.lock().unwrap().clone() {
        if let Ok(value) = serde_json::from_str::<Value>(payload) {
          if let Err(err) = app.emit("phonics://speech", value) {
            log::error!("Failed to emit speech event: {err}");
          }
        }
      }
    }
  }
}

pub fn initialize(app: &AppHandle) {
  let holder = APP_HANDLE.get_or_init(|| Mutex::new(None));
  let mut guard = holder.lock().unwrap();
  if guard.is_none() {
    *guard = Some(app.clone());
    unsafe {
      phonics_set_callback(Some(handle_native_event));
    }
  }
}

pub fn start(expected_utterances: Vec<String>) -> Result<(), String> {
  if expected_utterances.is_empty() {
    return Err("No utterances provided for recognizer.".into());
  }
  let json = serde_json::to_string(&expected_utterances).map_err(|err| err.to_string())?;
  let c_string = CString::new(json).map_err(|err| err.to_string())?;
  unsafe {
    phonics_start_listening(c_string.as_ptr());
  }
  Ok(())
}

pub fn stop() {
  unsafe {
    phonics_stop_listening();
  }
}
