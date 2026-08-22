# Agora Launcher (Desktop Native)

Clean standalone desktop launcher for Agora AI models, built with **React 19**, **Vite**, **Tauri 2**, and **Rust**.

## Architecture & Directory Structure

```
Agora/
├── src/                      # Existing Agora Web Application
├── supabase/                 # Supabase configuration & migrations
├── package.json              # Web app dependencies & server scripts
└── launcher/                 # Standalone Desktop Launcher
    ├── src/                  # React 19 Frontend
    │   ├── components/       # Steam-inspired UI views (Home, Library, Deployments, Store, Settings)
    │   ├── context/          # Supabase Auth & Launcher State Providers
    │   ├── lib/              # Supabase Client connection
    │   ├── types/            # Model, Library, & Deployment type declarations
    │   ├── App.tsx           # Window shell & main content router
    │   └── main.tsx          # React application entry point
    ├── src-tauri/            # Tauri 2 Native Rust Application
    │   ├── Cargo.toml        # Rust dependencies (tauri v2, serde, tauri-plugin-opener)
    │   ├── build.rs          # Tauri build initialization
    │   ├── src/
    │   │   ├── main.rs       # Native entry point
    │   │   └── lib.rs        # Tauri native commands & handlers
    │   ├── capabilities/
    │   │   └── default.json  # Secure capability declarations
    │   └── tauri.conf.json   # Window size (1320x860), title, and bundle configuration
    ├── package.json          # Launcher frontend & Tauri CLI scripts
    ├── vite.config.ts        # Vite configuration tailored for Tauri 2
    ├── tsconfig.json         # TypeScript configuration
    └── .env.example          # Supabase environment variables
```

## Running the Launcher

### 1. Install Dependencies
```bash
cd launcher
npm install
```

### 2. Run in Desktop Development Mode
```bash
npm run tauri dev
```
This boots the local Vite frontend on `http://localhost:1420` and launches the native **Agora Launcher** desktop window (1320 × 860).

### 3. Build Desktop Executable
```bash
npm run tauri build
```

## System Requirements & Prerequisites

### Windows
- **Microsoft Visual Studio C++ Build Tools** (or Visual Studio 2022 with Desktop development with C++)
- **WebView2 Runtime** (pre-installed on Windows 10/11)
- **Rust toolchain** (`rustup` with `stable-x86_64-pc-windows-msvc`)
- **Node.js** v18+

### macOS
- **Xcode Command Line Tools** (`xcode-select --install`)
- **Rust toolchain** (`rustup default stable`)
- **Node.js** v18+

### Linux
- WebKit2GTK and build essentials:
  ```bash
  sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
  ```

## Supabase Connection & Shared Auth
The launcher directly connects to your existing Agora Supabase project using:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

It shares the identical user accounts, model library table (`library`), models catalog (`models`), and active cloud deployments (`deployments`) as the Agora website.
