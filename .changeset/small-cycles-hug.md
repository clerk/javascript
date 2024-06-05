---
'@clerk/nextjs': patch
---

Updated the check ran against the error caught by `buildRequestLike()` to re-throw Static Bailout errors thrown by React in the context of PPR (Partial Pre-Rendering), as these errors shouldn't be caught. This change was required as we have been checking the error message itself, but stopped working after the message was changed in a Next.js update a few months ago.

- Breaking PR: https://github.com/vercel/next.js/commit/3008af6b0e7b2c8aadd986bdcbce5bad6c39ccc8#diff-20c354509ae1e93e143d91b67b75e3df592c38b7d1ec6ccf7c4a2f72b32ab17d
- Why PPR errors shouldn't be caught: https://nextjs.org/docs/messages/ppr-caught-error
- Previous fix: https://github.com/clerk/javascript/pull/2518
