---
'@clerk/ui': patch
---

Reduce layout shift while loading the organization and billing UI. The domain list, billing subscription section, and payment methods now reserve their loaded height while data is fetched, and the subscription section shows a loading indicator instead of rendering nothing.
