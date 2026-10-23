import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Native (APK) wrapper configuration.
 *
 * The WebView must load the LIVE published site (not a local bundle and not a
 * dev/preview address) because "Continue with Google" runs its OAuth redirect
 * chain through the hosted /~oauth endpoints on that domain. A local bundle or
 * a sleeping dev URL is what produces the 404 after Google sign-in.
 *
 * allowNavigation keeps oauth.lovable.app, accounts.google.com and the
 * redirect back to the app inside the WebView instead of failing.
 */
const config: CapacitorConfig = {
  appId: 'app.lovable.b437c71dd747422ab74379f704f3d629',
  appName: 'jinnahsupermart',
  webDir: 'dist',
  server: {
    url: 'https://jinnahsupermart.lovable.app',
    cleartext: true,
  },
  allowNavigation: ['*.lovable.app', '*.lovableproject.com', 'accounts.google.com'],
};

export default config;
