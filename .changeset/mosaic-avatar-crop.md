---
'@clerk/mosaic': minor
---

Picking a profile picture in `UserProfile`, or a logo in `OrganizationProfile` or `CreateOrganization`, now opens a dialog to crop it to a square before it uploads. Users can drag, zoom, rotate a quarter turn and reset. The crop keeps the picture's format and resolution, so it is never scaled up, and a picture over 4096px a side is scaled down. A crop that would save over the 10MB limit is scaled down until it fits. Cancelling uploads nothing. GIFs, animated PNGs and animated WebPs upload as picked, so their animation is kept.
