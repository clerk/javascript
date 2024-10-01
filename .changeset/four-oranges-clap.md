---
"@clerk/clerk-js": minor
"@clerk/types": minor
---

*Experimental Feature*: `<UserProfile/>` allows users to update their information. Mostly of this information is considered sensitive data.
We want to ensure that only the users themselves can alter any sensitive data.

To increase security we are now, require users to re-verify their credentials when they are about to perform these actions:


| Operation | Reverification | Strategy | Timeframe |
| --- |----------------| --- | --- |
| Update account (first/last name) | ❌              |  |  |
| Update username | ✅              | Strongest available | 10m |
| Delete account | ✅              | Strongest available | 10m |
| Create/Remove profile image | ❌              |  |  |
| Update password | ✅              | Strongest available | 10m |
| Remove password | ❌              |  |  |
| Revoke session | ✅              | Strongest available | 10m |
| Create identification | ✅              | Strongest available | 10m |
| Remove identification | ✅              | Strongest available | 10m |
| Change primary identification | ✅              | Strongest available | 10m |
| Update Passkey name | ❌              |  |  |
| Enable MFA (TOTP, Phone number) | ✅              | Strongest available | 10m |
| Disable MFA (TOΤP, Phone number) | ✅              | Strongest available | 10m |
| Create/Regenerate Backup Codes | ✅              | Strongest available | 10m |
| Connect External Account | ✅              | Strongest available | 10m |
| Re-authorize External Account | ❌              |  |  |
| Remove External Account | ✅              | Strongest available | 10m |
| Leave organization | ❌              |  |  |
