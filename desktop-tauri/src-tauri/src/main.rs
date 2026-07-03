// SerikaCord native desktop shell (Tauri v2).
// Loads the hosted web app and provides the desktop niceties the old
// Electron wrapper had: tray icon, close-to-tray, single instance,
// serikacord:// deep links, and external links opening in the browser.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WebviewUrl, WebviewWindowBuilder,
};
use tauri_plugin_opener::OpenerExt;

const APP_URL: &str = "https://waifu.ws";
const START_PATH: &str = "/channels/me";

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_main_window(app);
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            let start_url: tauri::Url = format!("{APP_URL}{START_PATH}")
                .parse()
                .expect("valid start URL");

            // Links outside the app (and localhost during development) open
            // in the system browser instead of navigating the app window.
            let opener_handle = app.handle().clone();
            WebviewWindowBuilder::new(app, "main", WebviewUrl::External(start_url))
                .title("SerikaCord")
                .inner_size(1280.0, 800.0)
                .min_inner_size(940.0, 500.0)
                .on_navigation(move |url| {
                    let target = url.as_str();
                    let allowed =
                        target.starts_with(APP_URL) || target.starts_with("http://localhost");
                    if !allowed {
                        let _ = opener_handle.opener().open_url(target, None::<&str>);
                    }
                    allowed
                })
                .build()?;

            // Tray icon with Open/Quit; left-click toggles the window.
            let show_item = MenuItem::with_id(app, "show", "Open SerikaCord", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let tray_menu = Menu::with_items(app, &[&show_item, &quit_item])?;

            TrayIconBuilder::with_id("main-tray")
                .icon(app.default_window_icon().expect("bundled icon").clone())
                .tooltip("SerikaCord")
                .menu(&tray_menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => show_main_window(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                show_main_window(app);
                            }
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        // Close-to-tray: closing the window hides it, quit via the tray menu.
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running SerikaCord");
}
