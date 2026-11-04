---
'@clerk/mosaic': patch
---

Drop an image onto the profile picture row in `UserProfile` or the logo row in `OrganizationProfile` to upload it. While a file is dragged over the row, the avatar darkens and shows an upload icon. `FileUpload.Dropzone` now ignores drags that carry no files, such as selected text or links.
