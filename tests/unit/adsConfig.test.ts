import { describe, expect, it } from 'vitest';
import { GOOGLE_TEST_REWARDED_ID, resolveRewardedAdConfig } from '../../src/adsConfig';

describe('resolveRewardedAdConfig', () => {
  it('uses the platform-specific configured id in production', () => {
    const env = {
      DEV: false,
      VITE_ADMOB_ANDROID_REWARDED_ID: 'ca-app-pub-android/1',
      VITE_ADMOB_IOS_REWARDED_ID: 'ca-app-pub-ios/2',
    };
    expect(resolveRewardedAdConfig('android', env)).toEqual({ adId: 'ca-app-pub-android/1', isTesting: false });
    expect(resolveRewardedAdConfig('ios', env)).toEqual({ adId: 'ca-app-pub-ios/2', isTesting: false });
  });

  it('falls back to the Google test unit when unset or blank', () => {
    expect(resolveRewardedAdConfig('android', { DEV: false })).toEqual({
      adId: GOOGLE_TEST_REWARDED_ID,
      isTesting: true,
    });
    expect(resolveRewardedAdConfig('android', { DEV: false, VITE_ADMOB_ANDROID_REWARDED_ID: '   ' })).toEqual({
      adId: GOOGLE_TEST_REWARDED_ID,
      isTesting: true,
    });
  });

  it('forces test mode in dev builds even with a real id', () => {
    const cfg = resolveRewardedAdConfig('android', { DEV: true, VITE_ADMOB_ANDROID_REWARDED_ID: 'ca-app-pub-real/9' });
    expect(cfg).toEqual({ adId: 'ca-app-pub-real/9', isTesting: true });
  });

  it('uses the test unit on web (no platform-specific id)', () => {
    expect(resolveRewardedAdConfig('web', { DEV: false })).toEqual({
      adId: GOOGLE_TEST_REWARDED_ID,
      isTesting: true,
    });
  });
});
