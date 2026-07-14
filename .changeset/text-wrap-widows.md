---
'@clerk/ui': patch
---

Headings now use `text-wrap: balance` and body text uses `text-wrap: pretty` to reduce widows and orphans when text wraps across lines. This is a progressive enhancement that falls back to normal wrapping in browsers without support.
