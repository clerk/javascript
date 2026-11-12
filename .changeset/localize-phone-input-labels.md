---
'@clerk/mosaic': patch
---

`PhoneInput` requires `countryTriggerLabel`, `countryPopupLabel`, and `countrySearchLabel`, which set the accessible names of its country trigger, popup, and search input. The country picker in UserProfile's add phone number and add SMS verification dialogs can now be localized through the `userProfile.phone.addDialog.phone.*` keys.
