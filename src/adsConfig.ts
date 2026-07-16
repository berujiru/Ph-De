/**
 * AdMob rewarded-ad configuration, resolved from Vite env vars (VITE_* — see
 * .env.example). Kept as a pure module (no Capacitor import) so it unit-tests
 * cleanly and is safe to load in the web bundle. The actual plugin lives behind
 * AdsManager's native-only dynamic import.
 *
 * Unset / blank unit IDs fall back to Google's public test ad unit so the flow
 * works out of the box, and dev builds always force test mode so a real AdMob
 * account is never billed by local testing.
 */

/** Google's always-available test rewarded ad unit (safe to ship as a fallback). */
export const GOOGLE_TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

export interface RewardedAdConfig {
  /** The ad unit id to request. */
  adId: string;
  /** When true, AdMob is initialized in test mode (test ads only). */
  isTesting: boolean;
}

type EnvLike = Record<string, string | boolean | undefined>;

function trimmed(raw: string | boolean | undefined): string {
  return typeof raw === 'string' ? raw.trim() : '';
}

/**
 * Resolve the rewarded-ad unit for a Capacitor platform ('android' | 'ios' |
 * 'web' | …). A blank/unset id → Google's test unit in test mode; a real id in
 * a dev build stays in test mode to protect the account.
 */
export function resolveRewardedAdConfig(
  platform: string,
  env: EnvLike = import.meta.env,
): RewardedAdConfig {
  const forceTest = env.DEV === true || env.DEV === 'true';

  const configured =
    platform === 'ios'
      ? trimmed(env.VITE_ADMOB_IOS_REWARDED_ID)
      : platform === 'android'
        ? trimmed(env.VITE_ADMOB_ANDROID_REWARDED_ID)
        : '';

  if (!configured) {
    return { adId: GOOGLE_TEST_REWARDED_ID, isTesting: true };
  }
  return { adId: configured, isTesting: forceTest };
}
