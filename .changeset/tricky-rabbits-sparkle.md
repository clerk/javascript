---
"@clerk/clerk-js": patch
---

In a previous release the protocol validation for window navigation was added ([ref](https://github.com/clerk/javascript/commit/b91e0ef4036d215da09d144f85b0a5ef2afe6cba)). Since then only `http:` and `https:` were allowed.

With this release `wails:` is also supported again. If you think that the mentioned commit introduced a regression for you and your protocol should be supported, please open an issue.
