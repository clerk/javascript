---
'@clerk/mosaic': patch
---

`PhoneInput` accepts `countryTriggerLabel`, `countryPopupLabel`, and `countrySearchLabel` to set the accessible names of its country trigger, popup, and search input. The country picker in UserProfile's add phone number and add SMS verification dialogs can now be localized through the `userProfile.phone.addDialog.phone.*` keys.
