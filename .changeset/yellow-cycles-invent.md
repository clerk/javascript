---
'@clerk/clerk-js': patch
---

Stop falling back to the Clerk proxy worker if turnstile fails to load as it is not as accurate as challenges.cloudflare.com
