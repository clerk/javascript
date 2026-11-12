---
'@clerk/mosaic': minor
---

Picking a profile picture in `UserProfile`, or a logo in `OrganizationProfile` or `CreateOrganization`, now opens a dialog to crop it before it uploads. Users can drag, zoom, rotate a quarter turn and reset, then save a 512px square PNG. Cancelling uploads nothing. GIFs upload as picked, so their animation is kept.
