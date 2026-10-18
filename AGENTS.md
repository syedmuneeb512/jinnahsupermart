# Architecture rules
- Keep the homepage's supporting shopping sections in a separate component and reuse the homepage product data; this avoids extra requests and leaves the existing shopping flow unchanged.
- Use shared TanStack Query keys for storefront and user-scoped reads, preload them before navigation, and invalidate after writes; this prevents repeated loading waits while keeping changes visible.
- Persist only short-lived public catalog data in session storage, never account data; this speeds reloads without exposing another user's profile or orders.
- Consume admin status from AuthContext and defer database reads outside auth callbacks; this avoids duplicate checks and session-lock contention.