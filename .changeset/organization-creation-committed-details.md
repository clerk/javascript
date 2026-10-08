---
'@clerk/ui': patch
---

Lock organization name, slug, and logo controls after creation succeeds. If a later step fails, retry with the same organization and details. Keep the controls editable when creation itself fails.
