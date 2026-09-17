---
'@clerk/mosaic': patch
---

Add Mosaic two-step verification screens for setting up authenticator apps, SMS verification, and backup codes, with actions to manage verification methods and save or regenerate backup codes.

When enrollment supplies backup codes, setup adds their row automatically and opens the Save your backup codes screen after SMS or authenticator verification. Backup codes are not offered in Add; existing codes can be regenerated from their row.
