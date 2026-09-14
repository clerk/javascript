---
'@clerk/shared': minor
'@clerk/ui': patch
---

Add `agentid` to `OAuthProvider` and `OAUTH_PROVIDERS` to support the "Continue with AgentID" OAuth flow. Instances with the connection enabled now render a "Continue with AgentID" button, with the AgentID mark tinted to match the theme's foreground color so it stays legible in dark mode.
