---
'@clerk/mosaic': patch
---

Fix screen readers announcing the wrong option, or no option, after typing in a Combobox search, such as the PhoneInput country picker. The search input now always points to the highlighted option, and points to nothing when no options match.
