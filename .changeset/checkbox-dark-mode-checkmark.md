---
"@clerk/ui": patch
---

Fix the checked checkbox appearing as a blank filled box in dark themes. The checkmark now uses the `colorPrimaryForeground` theme color, so it stays legible against the checkbox background across light, dark, and custom themes.
