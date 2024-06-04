---
'@clerk/clerk-js': patch
---

In some instances your application logo (shown at the top of the sign-in/sign-up form of the prebuilt components) might have been distorted in browsers like Firefox. By applying `object-fit: contain` to the image's CSS the logo now fills its bounding box without being distorted.
