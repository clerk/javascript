---
'@clerk/ui': patch
---

Fix tooltips rendering behind modals (for example on the organization profile Security page). Tooltips now layer above modal content, and pressing Escape or clicking outside while a tooltip is open inside a modal closes only the tooltip instead of also dismissing the modal.
