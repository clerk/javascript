---
'@clerk/localizations': minor
'@clerk/ui': minor
---

Monetary amounts are now formatted using your application's locale. For example, with the locale set to `fr-FR`, a USD 1000 amount now renders as `1 000,00 $US`; previously, it rendered as `$1,000.00` regardless of your application's configured locale.