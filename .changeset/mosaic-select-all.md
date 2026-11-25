---
'@clerk/mosaic': minor
---

Add `Select.SelectAll` for multiple selects. It selects every enabled item, or clears them once all are selected, and shows a check when all are selected and a dash when some are. It renders nothing in a single select. While the row is rendered and enabled, Ctrl+A (⌘+A on macOS) does the same from the open list.

Add `Select.Separator`, a divider between items, such as below `Select.SelectAll`. Screen readers skip it.

The organization select in `OAuthConsent` now has a "Select all" row when the user picks which organizations to grant access to.
