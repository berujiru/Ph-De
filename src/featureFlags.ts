/**
 * Build-time feature flags, driven by Vite env vars (VITE_* — see .env.example).
 * These are read once at module load, so changing one needs a `vite` restart /
 * rebuild. Vite statically replaces `import.meta.env.VITE_*`, so a disabled
 * feature can also be tree-shaken out of production bundles.
 */

/** Parse a VITE_ boolean env var; falls back to `fallback` when unset/blank. */
function envBool(raw: unknown, fallback: boolean): boolean {
  if (raw === 'true' || raw === '1') return true;
  if (raw === 'false' || raw === '0') return false;
  return fallback;
}

/**
 * Whether to surface the Attack Sandbox (its entry on the Campaign map, and by
 * extension the sandbox route). It's a mechanics-testing tool, so it defaults
 * to visible in dev builds and hidden in production. Set VITE_SHOW_SANDBOX to
 * `true`/`false` in a `.env` file to force it on/off regardless of build mode.
 */
export const SHOW_SANDBOX: boolean = envBool(
  import.meta.env.VITE_SHOW_SANDBOX,
  import.meta.env.DEV,
);

/**
 * Whether to surface the real-money "Puhunan Counter" (Hope/Permit top-ups) on
 * WEB builds, where purchases are simulated. Native builds always show it — this
 * flag only gates the web-simulated UI, so it's visible in dev for testing and
 * hidden on production web deploys. Set VITE_SHOW_IAP_WEB_SIM to force on/off.
 */
export const SHOW_IAP_WEB_SIM: boolean = envBool(
  import.meta.env.VITE_SHOW_IAP_WEB_SIM,
  import.meta.env.DEV,
);
