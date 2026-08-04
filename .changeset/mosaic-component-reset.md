---
'@clerk/ui': patch
---

Mosaic components now carry a minimal reset, so they no longer inherit user-agent margins, padding, or fonts. Previously only the components built on slot recipes were reset; the rest picked up browser defaults, most visibly `<Text>` and `<Heading>`, which rendered with the browser's paragraph and heading margins.

Text and headings now sit flush with their container. A layout that relied on the browser's default spacing around them needs to set that spacing explicitly.
