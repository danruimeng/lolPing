# lolPing

League of Legends–style ping wheel for your Windows desktop. Hold **Alt**, drag, and release on a slice to drop an animated ping, with its original sound, anywhere on any monitor.

Pings show up in whole-screen capture (Discord "Screen", OBS Display Capture, screenshots).

## Use

- **Alt + drag** opens the wheel. Release on a slice to ping; release in the centre, right-click or press Esc to cancel.
- **Ctrl + Alt + P** turns pinging on and off.
- **Tray icon:** left-click opens Settings. In Settings you can change:
  - the trigger key (Alt, Ctrl, Shift, Win, Caps Lock, Mouse 4/5 or any key)
  - whether Alt + click places a generic ping
  - the toggle shortcut
  - ping size, duration and volume
  - launch at startup

Wheel, top then clockwise: Danger · Push · On My Way · All In · Assist Me · Need Vision · Enemy Missing · Enemy Vision.

## Build from source

Requirements: Windows 11, Node 22.12+, and Visual Studio 2022 with the "Desktop development with C++" workload.

```bash
npm install
npm run build:helper
npm run dev
```

Other commands:
- `npm test`: TypeScript tests. They include a protocol test that runs the real helper in `--simulate` mode.
- `npm run test:helper`: C++ tests for the input logic.
- `npm run dist`: builds the installer into `release/`.

## How it works

- **Input:** `native/hook-helper` is a small C++ process. It owns the low-level mouse and keyboard hooks and swallows the Alt+drag so the app underneath never sees it. It talks to Electron as JSON lines over stdin/stdout.
- **Display:** Electron draws the wheel and pings in one transparent, click-through, always-on-top window per monitor, and plays sounds through Web Audio.
- **Details:** see `docs/design.md`.

## Limitations

- The wheel can't be triggered over elevated (administrator) windows such as Task Manager.
- Exclusive-fullscreen games draw above the overlay.
- Single-window screen capture doesn't include the overlay.

## Assets

Ping icons and sounds are © Riot Games, extracted from League of Legends. See `tools/extract-assets`.
