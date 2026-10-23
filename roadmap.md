# Homepage additions
- [x] Add illustrated product section, store features, FAQ, and simple footer below products.
- [x] Verify FAQ, product links, footer links, and small-screen layout.

# Page loading performance
- [x] Reuse and preload shopping data without changing screens or checkout behavior.
- [x] Remove redundant authentication refresh requests and repeated role checks.
- [x] Verify public navigation, reloads, and caching regression tests (4 passed).
- [ ] Verify signed-in profile and login transition: blocked until the user signs in through the preview; no account matched the requesting user's identity.

# Persistent sign-in and APK Google login
- [x] Verify restored sign-in survives navigation and reopening the website; no runtime errors during the check.
- [x] Verify hosted Google sign-in entry: published website reaches accounts.google.com without a 404 (Google account authentication not completed).
- [x] Diagnose APK Google sign-in 404: the wrapper was loading a dev/preview address; created capacitor.config.ts pointing the WebView at the published site with allowNavigation for the OAuth chain. User must git pull, run `npx cap sync`, and rebuild the APK to pick it up.
- [ ] User rebuilds APK from their own repo with the updated capacitor.config.ts and re-tests Continue with Google.