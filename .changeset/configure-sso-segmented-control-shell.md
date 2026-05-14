---
'@clerk/localizations': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Add a two-mode segmented control to the SAML config submission sub-step in `<__experimental_ConfigureSSO />`. Users pick between **Add via metadata URL** (default) and **Configure manually**. The metadata URL form is unchanged; the manual entry form ships in a follow-up commit. Locale keys added under `configureSSO.configureStep.samlOkta.modes` in `en-US`.
