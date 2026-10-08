---
'@clerk/mosaic': patch
---

Fix a drawer with snap points resting at an invalid position when `snapPoints` shrinks below the active snap point. Fix `UserProfile` and `OrganizationProfile` crashing when no pages are available to show; they now log a warning instead.
