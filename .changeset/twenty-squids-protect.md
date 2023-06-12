---
'@clerk/backend': minor
'gatsby-plugin-clerk': patch
'@clerk/clerk-sdk-node': patch
'@clerk/nextjs': patch
'@clerk/remix': patch
---

Support `audience` parameter in authentication request 

The audience parameter is used to verify the the aud claim in
the request matches the value of the parameter or is included
(when the user provides a list).

Resolves: 
- [#978](https://github.com/clerkinc/javascript/pull/978)
- [#1004](https://github.com/clerkinc/javascript/pull/1004)
