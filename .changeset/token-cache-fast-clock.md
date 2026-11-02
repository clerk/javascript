---
'@clerk/clerk-js': patch
---

Age freshly minted session tokens from local insert time for their full lifetime so a fast device clock no longer drops every mint and forces the poller to POST `/tokens` every 1.5s. Hydrated and broadcast tokens still use `min(exp, localLifetime)` from #10401.
