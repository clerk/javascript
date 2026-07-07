---
'@clerk/shared': patch
'@clerk/ui': patch
---

Polish the Protect check card: the loading spinner now hides while a challenge widget (e.g. Turnstile) is visible instead of spinning alongside it, only appears after a short delay so near-instant checks never flash it, and the card no longer reserves empty space above the spinner before a widget has rendered.
