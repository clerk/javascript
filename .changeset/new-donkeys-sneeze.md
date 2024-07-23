---
"@clerk/clerk-js": patch
---

Fixes a bug where multiple tabs with different active organizations would not always respect the selected organization. Going forward, when a tab is focused the active organization will immediately be updated to the tab's last active organization.
