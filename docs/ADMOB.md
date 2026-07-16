# AdMob Rewarded Ads

Players earn Rally Permits in the Sari-Sari Store two free ways:

- **Daily Ration** — claim 5 permits once per local calendar day (resets at local
  midnight).
- **Watch a Sponsor** — a rewarded AdMob ad grants **10 permits**, capped at **5
  ads/day**.

Both are wired through `src/game/data/metaState.ts`
(`claimDailyPermits`, `grantAdReward`, `adsRemainingToday`, `canClaimDaily`) and
surfaced by the "Aling Nena's Freebies" section of
`src/ui/mockups/SariSariStore.tsx`. When a player runs out of permits, the
Preparation screen shows a **"Get Permits at the Store"** CTA that routes to the
store and returns to the same stage.

## How the ad path works

- **Web / dev**: there is no AdMob SDK in a browser, so `AdsManager.showRewarded()`
  *simulates* an ad (~1.5s delay, then grants the reward). This keeps the whole
  flow testable in `npm run dev` and in unit tests.
- **Native (Capacitor android/ios)**: `src/game/core/AdsManager.ts` loads
  `@capacitor-community/admob` via a **dynamic import** (native-only, so the web
  bundle never evaluates it). A missing or failing plugin degrades to status
  `unavailable`; the ad button disables and nothing throws.

## Configuration

Ad unit IDs come from Vite env vars (see `.env.example`). Unset/blank falls back
to Google's public **test** ad unit, and dev builds always force test mode so a
real AdMob account is never billed locally.

```
VITE_ADMOB_ANDROID_REWARDED_ID=ca-app-pub-4958090008471573/3548496798
VITE_ADMOB_IOS_REWARDED_ID=ca-app-pub-4958090008471573/3548496798
```

Resolution logic lives in `src/adsConfig.ts` (`resolveRewardedAdConfig`).

## Native packaging (do when `android/`/`ios/` are generated)

The native platform folders are not generated yet. When they are
(`npm run cap:add:android` / `cap:add:ios`), complete these one-time steps — the
web build and tests stay green without them.

1. `npx cap sync` after installing `@capacitor-community/admob`.
2. **Android** — in `android/app/src/main/AndroidManifest.xml`, inside
   `<application>`:
   ```xml
   <meta-data
     android:name="com.google.android.gms.ads.APPLICATION_ID"
     android:value="ca-app-pub-3940256099942544~3347511713"/>
   ```
   This is the AdMob **app ID** (distinct from the ad-unit IDs above and *not* an
   env var). The value shown is Google's test app ID — replace it with the real
   `ca-app-pub-4958090008471573~XXXXXXXXXX` app ID created in the AdMob console
   before release.
3. **iOS** — in `ios/App/App/Info.plist`: add `GADApplicationIdentifier` (same
   app-ID note), the `SKAdNetworkItems` array from Google's docs, and
   `NSUserTrackingUsageDescription` if tracking authorization is requested.

Consent / UMP flows are out of scope for the initial integration.
