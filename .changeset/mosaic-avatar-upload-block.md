---
'@clerk/mosaic': patch
---

The logo picker in `CreateOrganization` now matches `UserProfile` and `OrganizationProfile`: once a logo is chosen, the Upload button is replaced by a menu to change or remove it, and an image can be dropped onto the row. Clicking the Logo label opens the file picker, and a rejected file's error now shows below the row instead of replacing the description. In all three, dragging a file of an unsupported type over the avatar shows a blocked icon instead of the upload arrow. In `OrganizationProfile`, the logo menu no longer shows icons, and its Remove item now uses the destructive color, as in `UserProfile`.
