# iOS Deployment Guide

Guide for deploying the Phonics Reader app to physical iOS devices.

## Prerequisites

### Device Connection

**YES - Your iPad must be connected to your Mac.**

For initial deployment and most development work, you need:

1. **USB Cable Connection**
   - Connect your iPad to your Mac using a Lightning/USB-C cable
   - The device must be physically connected for deployment
   - Keep it connected while developing for fastest deployment

2. **Device Trust** (First-time setup)
   - Unlock your iPad
   - When prompted "Trust This Computer?", tap **Trust**
   - Enter your iPad passcode if requested
   - This only needs to be done once per Mac

3. **Developer Mode** (iOS 16+ only)
   - If your iPad runs iOS 16 or later, you may need to enable Developer Mode
   - Go to Settings > Privacy & Security > Developer Mode
   - Toggle it on and restart your iPad

### Optional: Wireless Debugging (Once Set Up)

After initial USB setup, you can enable wireless debugging:

1. Connect iPad via USB (first time)
2. Open Xcode (Cmd+Shift+2 for Devices window)
3. Select your iPad
4. Check "Connect via network"
5. Disconnect cable - future deployments work wirelessly (if on same WiFi)

**Note:** Wireless debugging can be slower and less reliable than USB, especially for large builds. USB is recommended for active development.

## Quick Start

### Update App on Device (After Code Changes)

**Before starting: Connect your iPad via USB cable**

The fastest way to see your changes on your iPad:

```bash
# Kill any running dev servers
killall node xcodebuild 2>/dev/null

# Start dev mode (includes hot reload)
pnpm tauri ios dev
```

This will:
1. Build your React frontend
2. Compile Rust code
3. Deploy to your connected device
4. Enable hot reload for quick iteration

## Deployment Methods

### Method 1: Development Mode (Recommended for Testing)

Best for rapid iteration with hot reload enabled:

```bash
pnpm tauri ios dev
```

**Features:**
- Hot reload for frontend changes (React, CSS, TypeScript)
- Automatic recompilation of Rust code
- Connects to local dev server (port 1420)
- Fastest iteration cycle

**When to use:** During active development when making frequent changes

### Method 2: Production Build

For testing the final optimized build:

```bash
# Build the app
pnpm tauri ios build

# Deploy to device
pnpm tauri ios run
```

**Features:**
- Optimized production build
- Minified frontend code
- Release-mode Rust compilation
- No dev server dependency

**When to use:** Testing performance, preparing for distribution, or when dev mode has issues

### Method 3: Via Xcode

For advanced debugging or manual deployment:

```bash
# Open project in Xcode
pnpm tauri ios build --open
```

Then use Xcode's build and run controls (Cmd+R).

**When to use:** Need Xcode debugger, profiling tools, or manual device selection

## Device Connection

### List Connected Devices

To see all available iOS devices:

```bash
xcrun instruments -s devices
```

Your iPad should appear in the list. Example output:
```
iPad Air (5th generation) (16.0) [00008101-000E4186229BA01E]
```

### Deploy to Specific Device

If you have multiple devices connected:

```bash
pnpm tauri ios dev "iPad Air (5th generation)"
```

Or use the device UDID:
```bash
pnpm tauri ios dev "00008101-000E4186229BA01E"
```

## Build Configurations

### Current Setup

- **Bundle ID:** `com.phonicsreader.app`
- **Team:** Michael Milliken (FF64TZB7HR)
- **iOS Target:** 13.0+
- **Architecture:** arm64 (physical devices)
- **Export Method:** Development/Debugging

### Build Locations

After building, find outputs here:

```
src-tauri/gen/apple/build/
├── arm64/
│   └── Phonics Reader.ipa          # Installable app package
├── Payload/
│   └── Phonics Reader.app/         # App bundle
└── phonics-reader_iOS.xcarchive/   # Xcode archive
```

## Troubleshooting

### "No devices found" or "Device not recognized"

**Problem:** iPad not showing up when running deployment commands

**This is the most common issue! Follow these steps in order:**

1. **Physical connection:**
   - ✅ iPad is connected via USB cable (not just WiFi)
   - ✅ Cable is fully inserted on both ends
   - ✅ Try a different USB port (prefer USB-A ports over hubs)
   - ✅ Try a different cable if available

2. **Device trust:**
   - ✅ iPad is unlocked (not sleeping)
   - ✅ "Trust This Computer?" prompt appeared and you tapped "Trust"
   - ✅ You entered your iPad passcode when prompted

3. **Developer Mode (iOS 16+):**
   - ✅ Settings > Privacy & Security > Developer Mode is ON
   - ✅ iPad has been restarted after enabling Developer Mode

4. **Verify in Xcode:**
   - Open Xcode
   - Press Cmd+Shift+2 (Window > Devices and Simulators)
   - Your iPad should appear in the left sidebar
   - If it shows a yellow dot, wait for it to prepare
   - If it doesn't appear, restart Xcode

5. **Still not working?**
   - Disconnect and reconnect iPad
   - Restart your Mac
   - Update Xcode to latest version via App Store
   - Check if iPad appears in Finder sidebar (it should mount like a drive)

### "Provisioning profile has expired"

**Problem:** Current profile expires 12/13/25

**Solutions:**
1. Xcode should automatically renew for development builds
2. Manually refresh in Xcode:
   - Open project: `pnpm tauri ios build --open`
   - Select target "phonics-reader_iOS"
   - Go to "Signing & Capabilities"
   - Click "Download Manual Profiles" if needed
3. For App Store distribution, create new profile at developer.apple.com

### "Failed to code sign"

**Problem:** Signing certificate issues

**Solutions:**
1. Verify certificate is valid (expires 12/6/26)
2. In Xcode, go to Preferences > Accounts > Manage Certificates
3. Ensure "Apple Development" certificate is present
4. Try "Automatically manage signing" in Xcode project settings

### Dev server connection issues

**Problem:** App can't connect to dev server on physical device

**Solutions:**
1. Ensure Mac and iPad are on same WiFi network
2. Check firewall isn't blocking port 1420
3. Tauri automatically uses your public IP - verify in console output
4. Try accessing `http://[YOUR_IP]:1420` in device Safari as test

### Build is slow or fails

**Problem:** Long build times or random failures

**Solutions:**
1. Clean build folders:
   ```bash
   rm -rf src-tauri/gen/apple/build
   rm -rf src-tauri/target
   ```
2. Kill stuck processes:
   ```bash
   killall node xcodebuild
   ```
3. Rebuild:
   ```bash
   pnpm tauri ios build
   ```

### Changes not appearing on device

**Problem:** Code changes don't reflect in running app

**Solutions:**
1. For frontend changes: Should hot reload automatically
2. For Rust changes: Restart `pnpm tauri ios dev`
3. Force clean rebuild:
   ```bash
   killall node xcodebuild
   rm -rf src-tauri/target/aarch64-apple-ios
   pnpm tauri ios dev
   ```
4. Check console for build errors

## Important Notes

### Development vs Production

**Current setup uses "debugging" export method:**
- ✅ Perfect for development and testing
- ✅ Includes debugging entitlements
- ✅ Can install on registered devices
- ❌ Cannot distribute via App Store (need app-store-connect export method)
- ❌ Cannot distribute via TestFlight (need release configuration)

### Provisioning Profile Expiration

Your current provisioning profile expires **December 13, 2025**. After this date:
1. Xcode should auto-renew for development
2. You may need to manually refresh in Xcode settings
3. App Store distribution requires separate profile

### Asset Bundle

The app bundles audio files from `public/audio/` automatically. Changes to audio files require a full rebuild (not hot-reloaded).

### Architecture Notes

- **Physical devices:** arm64 (aarch64-apple-ios)
- **Apple Silicon simulator:** aarch64-apple-ios-sim
- **Intel simulator:** x86_64-apple-ios

The default `pnpm tauri ios dev` targets physical devices (arm64).

For simulator:
```bash
pnpm tauri ios dev --target aarch64-apple-ios-sim
```

## Common Workflows

### After Editing React/TypeScript Code

```bash
# Changes hot reload automatically if dev mode is running
# If not running:
pnpm tauri ios dev
```

### After Editing Rust Code

```bash
# Restart dev mode to recompile Rust
killall node xcodebuild
pnpm tauri ios dev
```

### After Editing CSS

```bash
# Changes hot reload automatically in dev mode
# No action needed
```

### Testing Production Performance

```bash
# Build optimized version
pnpm tauri ios build --release

# Run on device
pnpm tauri ios run --release
```

### Before Showing to Someone

```bash
# Clean build to ensure everything works
rm -rf src-tauri/gen/apple/build
pnpm tauri ios build
pnpm tauri ios run
```

## Quick Reference

**Remember: iPad must be connected via USB cable!**

| Task | Command |
|------|---------|
| Update app with changes | `pnpm tauri ios dev` |
| Production build | `pnpm tauri ios build` |
| Run on device | `pnpm tauri ios run` |
| Open in Xcode | `pnpm tauri ios build --open` |
| List devices | `xcrun instruments -s devices` |
| Verify device in Xcode | Cmd+Shift+2 in Xcode |
| Clean build | `rm -rf src-tauri/gen/apple/build` |
| Kill stuck processes | `killall node xcodebuild` |

## Getting Help

- **Tauri iOS docs:** https://tauri.app/v2/guides/build/ios/
- **Tauri Discord:** https://discord.gg/tauri
- **Project issues:** Check console output for detailed error messages
