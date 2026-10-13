---
'@clerk/ui': patch
---

Fix localization strings whose `link("…")` labels contain apostrophes, quotes, commas or parentheses. Previously, a custom label such as `link("Conditions d'utilisation")` rendered as "Conditions dutilisation"; quoted labels now render exactly as written.
