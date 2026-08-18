---
'@clerk/nextjs': patch
---

`clerkMiddleware()` now points key misconfiguration at the Clerk CLI: missing keys outside development throw a deploy-oriented error recommending `npx clerk@latest deploy` (`code=missing_env_keys_production`), and the publishable key format is validated upfront, throwing `npx clerk@latest init` guidance in development or `npx clerk@latest env pull --instance prod` guidance in production (`code=invalid_env_keys`, `code=invalid_env_keys_production`) instead of failing later with `Publishable key not valid.`
