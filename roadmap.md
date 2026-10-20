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
- [ ] Diagnose and verify APK Google sign-in: blocked on the wrapper's loaded website address and a screenshot showing the failing URL; no APK or wrapper configuration is available.