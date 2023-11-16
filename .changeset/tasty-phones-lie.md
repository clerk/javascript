---
'@clerk/localizations': major
'@clerk/clerk-react': major
'@clerk/types': major
---

Drop deprecations. Migration steps:
- drop `formFieldLabel__emailAddress_phoneNumber` from localization keys
- drop `formFieldLabel__phoneNumber_username` from localization keys
- drop `formFieldLabel__emailAddress_phoneNumber_username` from localization keys
- drop `formFieldInputPlaceholder__emailAddress_phoneNumber` from localization keys
- drop `formFieldInputPlaceholder__phoneNumber_username` from localization keys
- drop `formFieldInputPlaceholder__emailAddress_phoneNumber_username` from localization keys
- use `title__connectionFailed` instead of `title__conectionFailed` from localization keys
- use `actionLabel__connectionFailed` instead of `actionLabel__conectionFailed` from localization keys
- use `headerTitle__members` instead of `headerTitle__active` from localization keys
- use `headerTitle__invitations` instead of `headerTitle__invited` from localization keys
- drop `createOrganization.subtitle` from localization keys
- use `deDE` instead of `deDe` localization from `@clerk/localizations`
