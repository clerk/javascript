---
'@clerk/clerk-js': patch
---

Fix the standalone `<APIKeys />` component failing to render when an organization is active and user API keys are disabled but organization API keys are enabled. The component now correctly checks the user API keys setting only when no organization is active.
