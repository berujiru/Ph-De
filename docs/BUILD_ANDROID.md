# Building an Android APK for testing

First Ripple is a web-first app (React + Phaser) wrapped natively by
**Capacitor**. The web build in `dist/` is the source of truth; Capacitor copies
it into a thin native Android shell that Gradle turns into an APK.

The Capacitor config is already in place
([`capacitor.config.ts`](../capacitor.config.ts) — `appId: com.berujiru.phde`,
`webDir: dist`). What is **not** committed is the generated `android/` project;
it is gitignored on purpose (see [ARCHITECTURE.md](ARCHITECTURE.md) and
[.gitignore](../.gitignore)). Generating it locally is the one step between this
repo and a testable APK — that's what this guide covers.

## Prerequisites

- **Android Studio** (bundles the Android SDK and a compatible JDK 17).
- **`adb`** on your `PATH` (ships with the SDK platform-tools) — for installing
  onto a device/emulator.
- A device with USB debugging enabled, or an Android Virtual Device (AVD).

## 1. Scaffold the native project (one time)

Run from the repo root:

```bash
npm run build              # produces dist/ (tsc -b && vite build)
npm run cap:add:android    # generates the android/ project (gitignored)
npx cap sync android       # copies dist/ in and installs plugins' native deps
```

`cap sync` also wires up the native side of `@capacitor-community/admob` and
`cordova-plugin-purchase`.

Because `android/` is gitignored, this is fully re-runnable and never committed.
If the native project ever gets into a bad state, delete and re-scaffold:

```bash
rm -rf android && npm run cap:add:android && npx cap sync android
```

## 2. Add the AdMob application ID (one time, after scaffold)

The rewarded-ads plugin needs the AdMob **app ID** declared in the manifest.
Open `android/app/src/main/AndroidManifest.xml` and add this inside
`<application>`:

```xml
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="ca-app-pub-3940256099942544~3347511713"/>
```

The value above is **Google's public test app ID** — safe for testing. Replace
it with the real `ca-app-pub-4958090008471573~XXXXXXXXXX` app ID from the AdMob
console before any release build. This is distinct from the ad-*unit* IDs, which
come from Vite env vars — see [ADMOB.md](ADMOB.md) for the full ad
configuration.

> This edit lives inside the gitignored `android/` tree, so re-apply it after any
> `rm -rf android` re-scaffold.

## 3. Re-sync after every web change

Whenever you change anything under `src/` (or `public/`), rebuild the web bundle
and push it into the native shell before rebuilding the APK:

```bash
npm run build && npx cap sync android
```

Forgetting this is the #1 cause of "my change didn't show up in the APK".

## 4. Build a debug APK

Two equivalent paths — pick one.

**Android Studio (GUI):**

```bash
npx cap open android
```

Then in Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**. When it
finishes, click **locate** in the notification to reveal the APK.

**Gradle (CLI):**

```bash
cd android && ./gradlew assembleDebug
```

Either way the APK lands at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Debug APKs are auto-signed with the local debug keystore — fine for testing on
your own devices, but **not** distributable via the Play Store. A release build
(`./gradlew assembleRelease` with a real signing config / keystore) is a
separate, later concern and out of scope here.

## 5. Install and run on a device / emulator

With a device connected (USB debugging on) or an AVD running:

```bash
adb devices                                                   # confirm it's listed
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

`-r` reinstalls over an existing copy, keeping app data. Launch "First Ripple"
from the app drawer.

## Permissions — what the app asks for, and when

**Today the app needs no in-app permission prompt.** The permissions its plugins
require are all *normal / install-time* permissions: Android grants them silently
when the APK is installed, with no runtime dialog and no code on our side.

| Permission | Source plugin | Why | User prompt? |
|---|---|---|---|
| `android.permission.INTERNET` | Capacitor (default) | Load remote content, serve ads, reach billing | No — install-time |
| `com.google.android.gms.permission.AD_ID` | `@capacitor-community/admob` | Advertising ID for AdMob (Android 13+) | No — install-time |
| `com.android.vending.BILLING` | `cordova-plugin-purchase` | Google Play in-app purchases | No — install-time |

These are merged into the final manifest automatically by the plugins' own
manifest contributions — you don't add them by hand.

**Verify what actually shipped** in a built APK:

```bash
# From the SDK build-tools, e.g. .../Android/Sdk/build-tools/<ver>/aapt
aapt dump permissions android/app/build/outputs/apk/debug/app-debug.apk
```

or read the merged manifest report under
`android/app/build/outputs/logs/manifest-merger-debug-report.txt`.

### If you later add a feature that needs a *runtime* permission

Some future features do require asking the user at runtime. When that happens,
follow the pattern the codebase already uses for optional native capabilities
(`AdsManager` / `IapManager`): **request lazily at the point of need, show a
short in-app rationale first, and degrade quietly if denied** — the feature just
turns itself off; nothing throws.

- **Push notifications** — `@capacitor/push-notifications` pulls in
  `POST_NOTIFICATIONS`, which is a runtime permission on Android 13+. Gate the
  call behind a user action (e.g. a "Turn on reminders" toggle), show why you
  need it, then call `PushNotifications.requestPermissions()`. Treat a `denied`
  result as "notifications stay off."
- **iOS App Tracking Transparency** — only relevant if AdMob *personalized* ads
  are enabled. Requires `NSUserTrackingUsageDescription` in `Info.plist` plus a
  tracking-authorization request. Already flagged in the iOS notes of
  [ADMOB.md](ADMOB.md).

The current build enables neither, so no consent UI exists yet — and none is
needed until one of the above is added.

## Troubleshooting

- **Blank white screen on launch** — the web build wasn't synced, or `webDir` is
  wrong. Run `npm run build && npx cap sync android` and rebuild.
- **Gradle fails with a JDK/version error** — make sure Studio is using its
  bundled JDK 17 (Settings → Build Tools → Gradle → Gradle JDK).
- **`adb: no devices/emulators found`** — start an AVD or reconnect the device
  and re-enable USB debugging, then re-check with `adb devices`.
- **Ads never show on device** — expected until the AdMob app-ID `<meta-data>`
  from step 2 is present; without it the plugin degrades to `unavailable` (by
  design — see [AdsManager.ts](../src/game/core/AdsManager.ts)).
