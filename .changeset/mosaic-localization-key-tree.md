---
'@clerk/mosaic': minor
---

**Breaking:** Nest localization keys under the component they appear in, for example `userProfileMfa.label` is now `userProfile.mfa.label`. Update any `localization` overrides that use the old keys, written as nested objects or dot paths; TypeScript flags each one. Keys below a root stay the same unless listed here.

| Before                                 | After                                     |
| -------------------------------------- | ----------------------------------------- |
| `apiKeysTable`                         | `apiKeys`                                 |
| `membersTableTab`                      | `organizationProfile.members.list`        |
| `invitationsTableTab`                  | `organizationProfile.members.invitations` |
| `requestsTableTab`                     | `organizationProfile.members.requests`    |
| `organizationProfileInviteMembers`     | `organizationProfile.members.invite`      |
| `organizationProfileProfileSection`    | `organizationProfile.profile`             |
| `organizationProfileDangerSection`     | `organizationProfile.danger`              |
| `userProfileProfileSection`            | `userProfile.profile`                     |
| `userProfileContact`                   | `userProfile.contact`                     |
| `userProfileContact.email`             | `userProfile.email`                       |
| `userProfileContact.phone`             | `userProfile.phone`                       |
| `userProfileAddEmail`                  | `userProfile.email.addDialog`             |
| `userProfileAddPhone`                  | `userProfile.phone.addDialog`             |
| `userProfileConnectedAccounts`         | `userProfile.connectedAccounts`           |
| `userProfileEnterpriseAccountsSection` | `userProfile.enterpriseAccounts`          |
| `userProfileWeb3Wallets`               | `userProfile.web3Wallets`                 |
| `userProfilePasswordSection`           | `userProfile.password`                    |
| `userProfilePasskeys`                  | `userProfile.passkeys`                    |
| `userProfileMfa`                       | `userProfile.mfa`                         |
| `userProfileAddSms`                    | `userProfile.mfa.addSms`                  |
| `userProfileAddAuthenticator`          | `userProfile.mfa.addAuthenticator`        |
| `userProfileAuthenticatorSetup`        | `userProfile.mfa.authenticatorSetup`      |
| `userProfileBackupCodes`               | `userProfile.mfa.backupCodes`             |
| `userProfileActiveDevices`             | `userProfile.activeDevices`               |
| `userProfileDangerSection`             | `userProfile.danger`                      |

Keys under `reverification` are also renamed:

| Before                                                                                                   | After                                              |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `alternativeMethods.title`, `.description`                                                               | `methods.title`, `.description`                    |
| `alternativeMethods.blockButton__<method>`                                                               | `methods.<method>`                                 |
| `alternativeMethods.actionText`                                                                          | `methods.helpText`                                 |
| `alternativeMethods.actionLink`                                                                          | `methods.help`                                     |
| `alternativeMethods.getHelp.title`, `.description`                                                       | `help.title`, `.description`                       |
| `alternativeMethods.getHelp.blockButton__emailSupport`                                                   | `help.emailSupport`                                |
| `backupCodeMfa.*`                                                                                        | `backupCode.*`                                     |
| `formFieldLabel__backupCode`                                                                             | `backupCode.label`                                 |
| `formFieldLabel__password`                                                                               | `password.label`                                   |
| `formFieldInputPlaceholder__password`                                                                    | `password.placeholder`                             |
| `formFieldAction__showPassword`, `formFieldAction__hidePassword`                                         | `password.showPassword`, `.hidePassword`           |
| `emailCode.formTitle`, `phoneCode.formTitle`, `totpMfa.formTitle`                                        | `emailCode.label`, `phoneCode.label`, `totp.label` |
| `emailCode.resendButton`, `phoneCode.resendButton`                                                       | `emailCode.resend`, `phoneCode.resend`             |
| `totpMfa.title`, `.description`                                                                          | `totp.title`, `.description`                       |
| `phoneCodeMfa.*`                                                                                         | `phoneCode.*`, with the renames above              |
| `error.closeButton`                                                                                      | `error.close`                                      |
| `backButton`                                                                                             | `back`                                             |
| `formButtonPrimary`                                                                                      | `continue`                                         |
| `footerActionLink__useAnotherMethod`                                                                     | `useAnotherMethod`                                 |
| `unstable__errors__generic`                                                                              | `attemptFailed`                                    |
| `passkey.blockButton__passkey`, `password.actionLink`, `formButtonReset`, `identityPreviewEditButton__*` | Removed. Delete the override.                      |

Find usages with:

```sh
git grep -nE -e 'apiKeysTable|(members|invitations|requests)TableTab|organizationProfile(InviteMembers|DangerSection|ProfileSection)' \
  -e 'userProfile(ActiveDevices|AddEmail|AddPhone|AddAuthenticator|AddSms|AuthenticatorSetup|BackupCodes|ConnectedAccounts|Contact|DangerSection|EnterpriseAccountsSection|Mfa|Passkeys|PasswordSection|ProfileSection|Web3Wallets)'
```
