---
'@clerk/clerk-js': patch
---

Fix impersonation in CSR multi-session apps when admin has existing session. When `setActive` is called with a session ID that doesn't exist in the local client (e.g., a newly created impersonation session via ticket), the client is now reloaded to fetch the new session before activation.

