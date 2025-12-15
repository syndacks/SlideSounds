use serde::Deserialize;
use serde_json::json;
use tauri::{EventHandler, Manager};

#[cfg(target_os = "ios")]
mod ios;

#[derive(Deserialize)]
struct SpeechStartPayload {
  #[serde(rename = "expectedUtterances")]
  expected_utterances: Vec<String>,
}

struct SpeechEventGuards {
  _start: EventHandler,
  _stop: EventHandler,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      #[cfg(target_os = "ios")]
      {
        ios::initialize(&app.handle());

        let start_handle = {
          let handle = app.handle();
          handle.listen_global("phonics://speech:start", move |event| {
            let payload = event.payload();
            match serde_json::from_str::<SpeechStartPayload>(payload) {
              Ok(data) => {
                if let Err(err) = ios::start(data.expected_utterances) {
                  let _ = handle.emit(
                    "phonics://speech",
                    json!({ "type": "error", "message": err }),
                  );
                }
              }
              Err(err) => {
                log::error!("Failed to parse speech payload: {err}");
                let _ = handle.emit(
                  "phonics://speech",
                  json!({ "type": "error", "message": "Invalid speech payload" }),
                );
              }
            }
          })
        };

        let stop_handle = {
          app.handle().listen_global("phonics://speech:stop", move |_| {
            ios::stop();
          })
        };

        app.manage(SpeechEventGuards {
          _start: start_handle,
          _stop: stop_handle,
        });
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
