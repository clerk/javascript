---
'@clerk/ui': patch
---

The OAuth consent screen now shows a recognizable brand mark for well-known OAuth clients (Claude, ChatGPT) when the requesting application has not uploaded its own logo. Recognition is based on the request's registrable redirect domain, so a look-alike application name cannot borrow the branding. The brand mark exposes an accessible name for assistive technologies, and the logo badges are now customizable through the new `logoGroupItemContainer` appearance element.
