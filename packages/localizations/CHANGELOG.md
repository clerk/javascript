# Change Log

## 3.28.4

### Patch Changes

- Updated dependencies []:
  - @clerk/types@4.101.3

## 3.28.3

### Patch Changes

- Updated dependencies []:
  - @clerk/types@4.101.2

## 3.28.2

### Patch Changes

- Updated dependencies []:
  - @clerk/types@4.101.1

## 3.28.1

### Patch Changes

- Add Hebrew translations for waitlist component ([#7204](https://github.com/clerk/javascript/pull/7204)) by [@galeshayek](https://github.com/galeshayek)
  - Translated waitlist start screen (title, subtitle, form button, action links)
  - Translated waitlist success screen (title, subtitle, message)
  - corrected userProfile deletePage actionDescription

- Updated dependencies [[`d32d724`](https://github.com/clerk/javascript/commit/d32d724c34a921a176eca159273f270c2af4e787)]:
  - @clerk/types@4.101.0

## 3.28.0

### Minor Changes

- Support for `email_code` and `email_link` as a second factor when user is signing in on a new device. ([#7116](https://github.com/clerk/javascript/pull/7116)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Improve Korean (ko-KR) localization by translating missing strings ([#7200](https://github.com/clerk/javascript/pull/7200)) by [@HwangSB](https://github.com/HwangSB)
  - Translated undefined values to Korean

- Updated dependencies [[`b5a7e2f`](https://github.com/clerk/javascript/commit/b5a7e2f8af5514e19e06918632d982be65f4a854)]:
  - @clerk/types@4.100.0

## 3.27.2

### Patch Changes

- Updated dependencies [[`613cb97`](https://github.com/clerk/javascript/commit/613cb97cb7b3b33c3865cfe008ef9b1ea624cc8d)]:
  - @clerk/types@4.99.0

## 3.27.1

### Patch Changes

- Updated dependencies [[`296fb0b`](https://github.com/clerk/javascript/commit/296fb0b8f34aca4f527508a5e6a6bbaad89cfdaa)]:
  - @clerk/types@4.98.0

## 3.27.0

### Minor Changes

- Added localization entry for the API key copy modal component. ([#7107](https://github.com/clerk/javascript/pull/7107)) by [@wobsoriano](https://github.com/wobsoriano)

### Patch Changes

- Updated dependencies []:
  - @clerk/types@4.97.2

## 3.26.6

### Patch Changes

- Updated dependencies [[`85b5acc`](https://github.com/clerk/javascript/commit/85b5acc5ba192a8247f072fa93d5bc7d42986293)]:
  - @clerk/types@4.97.1

## 3.26.5

### Patch Changes

- Updated dependencies [[`2587aa6`](https://github.com/clerk/javascript/commit/2587aa671dac1ca66711889bf1cd1c2e2ac8d7c8)]:
  - @clerk/types@4.97.0

## 3.26.4

### Patch Changes

- Localize aria-labels within `UserButton` and `OrganizationSwitcher` triggers. ([#7086](https://github.com/clerk/javascript/pull/7086)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`439427e`](https://github.com/clerk/javascript/commit/439427e44adef4f43e5f0719adf5654ea58c33e7), [`7dfbf3a`](https://github.com/clerk/javascript/commit/7dfbf3aa1b5269aee2d3af628b02027be9767088), [`d33b7b5`](https://github.com/clerk/javascript/commit/d33b7b5538e9bcbbca1ac23c46793d0cddcef533)]:
  - @clerk/types@4.96.0

## 3.26.3

### Patch Changes

- Add title attribute to email address field with the recommended format. ([#6956](https://github.com/clerk/javascript/pull/6956)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Added missing translations for the fr-FR localization. ([#6950](https://github.com/clerk/javascript/pull/6950)) by [@semleti](https://github.com/semleti)

- Updated dependencies [[`4d46e4e`](https://github.com/clerk/javascript/commit/4d46e4e601a5f2a213f1718af3f9271db4db0911)]:
  - @clerk/types@4.95.1

## 3.26.2

### Patch Changes

- Updated dependencies [[`a172d51`](https://github.com/clerk/javascript/commit/a172d51df2d7f2e450c983a15ae897624304a764)]:
  - @clerk/types@4.95.0

## 3.26.1

### Patch Changes

- Updated dependencies [[`53214f9`](https://github.com/clerk/javascript/commit/53214f9a600074affc84d616bbbe7a6b625e7d33), [`1441e68`](https://github.com/clerk/javascript/commit/1441e6851102e9eed5697ad78c695f75b4a20db2)]:
  - @clerk/types@4.94.0

## 3.26.0

### Minor Changes

- [Billing Beta] Rename payment sources to method methods. ([#6959](https://github.com/clerk/javascript/pull/6959)) by [@panteliselef](https://github.com/panteliselef)

  Updates localization keys from `commerce` -> `billing` and `paymentSource` to `paymentMethod`.

- Introduce experimental step to choose enterprise connection on sign-in/sign-up ([#6947](https://github.com/clerk/javascript/pull/6947)) by [@LauraBeatris](https://github.com/LauraBeatris)

### Patch Changes

- Update copy for account deletion modal ([#6937](https://github.com/clerk/javascript/pull/6937)) by [@jescalan](https://github.com/jescalan)

- Expanded Brazilian Portuguese (pt-BR) localization ([#6881](https://github.com/clerk/javascript/pull/6881)) by [@hypeARM](https://github.com/hypeARM)

- Updated dependencies [[`65b7cc7`](https://github.com/clerk/javascript/commit/65b7cc787a5f02a302b665b6eaf4d4b9a1cae4b0), [`6e09786`](https://github.com/clerk/javascript/commit/6e09786adeb0f481ca8b6d060ae8754b556a3f9a), [`aa7210c`](https://github.com/clerk/javascript/commit/aa7210c7fff34f6c6e2d4ca3cb736bbd35439cb6), [`2cd53cd`](https://github.com/clerk/javascript/commit/2cd53cd8c713dfa7f2e802fe08986411587095fa), [`1a2eee6`](https://github.com/clerk/javascript/commit/1a2eee6b8b6ead2d0481e93104fcaed6452bd1b9), [`2cd53cd`](https://github.com/clerk/javascript/commit/2cd53cd8c713dfa7f2e802fe08986411587095fa), [`1a2430a`](https://github.com/clerk/javascript/commit/1a2430a166fb1df5fbca76437c63423b18a49ced), [`31a04fc`](https://github.com/clerk/javascript/commit/31a04fc2b783f01cd4848c1e681af3b30e57bb2f), [`22b8e49`](https://github.com/clerk/javascript/commit/22b8e49f9fb65d55ab737d11f1f57a25bf947511), [`a66357e`](https://github.com/clerk/javascript/commit/a66357e8a5928199aebde408ec7cfaac152c2c42), [`dacc1af`](https://github.com/clerk/javascript/commit/dacc1af22e1d1af0940b2d626b8a47d376c19342)]:
  - @clerk/types@4.93.0

## 3.25.7

### Patch Changes

- Updated dependencies [[`fba4781`](https://github.com/clerk/javascript/commit/fba4781ff2a2d16f8934029fa6fb77d70953f2be), [`a1f6714`](https://github.com/clerk/javascript/commit/a1f671480cda6f978db059ba0640d4ed8b08f112)]:
  - @clerk/types@4.92.0

## 3.25.6

### Patch Changes

- Updated dependencies [[`f737d26`](https://github.com/clerk/javascript/commit/f737d268aa167889a4f3f7aba2658c2ba1fd909a)]:
  - @clerk/types@4.91.0

## 3.25.5

### Patch Changes

- Updated dependencies [[`37028ca`](https://github.com/clerk/javascript/commit/37028caad59cb0081ac74e70a44e4a419082a999)]:
  - @clerk/types@4.90.0

## 3.25.4

### Patch Changes

- Updated dependencies [[`e3e77eb`](https://github.com/clerk/javascript/commit/e3e77eb277c6b36847265db7b863c418e3708ab6), [`090ca74`](https://github.com/clerk/javascript/commit/090ca742c590bc4f369cf3e1ca2ec9917410ffe4)]:
  - @clerk/types@4.89.0

## 3.25.3

### Patch Changes

- Fix account deletion placeholder and action description for en-GB and fi-FI locales ([#6814](https://github.com/clerk/javascript/pull/6814)) by [@severi](https://github.com/severi)

- Improved placeholder and prompt texts for email address fields, login subtitles, and email verification flows for the zhCN (Chinese - Simplified) locale ([#6811](https://github.com/clerk/javascript/pull/6811)) by [@CLCK0622](https://github.com/CLCK0622)

- Updated dependencies [[`41e0a41`](https://github.com/clerk/javascript/commit/41e0a4190b33dd2c4bdc0d536bbe83fcf99af9b0), [`1aa9e9f`](https://github.com/clerk/javascript/commit/1aa9e9f10c051319e9ff4b1a0ecd71507bd6a6aa), [`a88ee58`](https://github.com/clerk/javascript/commit/a88ee5827adee0cc8a62246d03a3034d8566fe21), [`d6c7bbb`](https://github.com/clerk/javascript/commit/d6c7bbba23f38c0b3ca7edebb53028a05c7b38e6)]:
  - @clerk/types@4.88.0

## 3.25.2

### Patch Changes

- Clarify "Delete Account" messaging ([#6779](https://github.com/clerk/javascript/pull/6779)) by [@tmilewski](https://github.com/tmilewski)

- Update "Delete account" messaging for all locales ([#6781](https://github.com/clerk/javascript/pull/6781)) by [@tmilewski](https://github.com/tmilewski)

- Add support for canceling past due subscriptions ([#6783](https://github.com/clerk/javascript/pull/6783)) by [@aeliox](https://github.com/aeliox)

- Add all missing german translations and improve existing ones. ([#6769](https://github.com/clerk/javascript/pull/6769)) by [@ubersan](https://github.com/ubersan)

- Updated dependencies [[`bcf24f2`](https://github.com/clerk/javascript/commit/bcf24f2f91913fa0dd3fbf02b3bbef345c4e1ea9), [`de90ede`](https://github.com/clerk/javascript/commit/de90ede82664b58bef9e294498384cf2c99a331e), [`9d4a95c`](https://github.com/clerk/javascript/commit/9d4a95c766396a0bc327fbf0560228bedb4828eb)]:
  - @clerk/types@4.87.0

## 3.25.1

### Patch Changes

- Updated dependencies [[`23948dc`](https://github.com/clerk/javascript/commit/23948dc777ec6a17bafbae59c253a93143b0e105), [`50a8622`](https://github.com/clerk/javascript/commit/50a8622c3579306f15e5d40e5ea72b4fe4384ef7)]:
  - @clerk/types@4.86.0

## 3.25.0

### Minor Changes

- Change placement of the manage subscription button inside `<UserProfile/>` and `<OrganizationProfile/>` ([#6428](https://github.com/clerk/javascript/pull/6428)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Fix formatting of cs-CZ localization strings ([#6717](https://github.com/clerk/javascript/pull/6717)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Introduce "Last Used" functionality to Sign In and Up ([#6722](https://github.com/clerk/javascript/pull/6722)) by [@tmilewski](https://github.com/tmilewski)

- Add back removed cs-CZ translations for form field errors ([#6713](https://github.com/clerk/javascript/pull/6713)) by [@ToliaGuy](https://github.com/ToliaGuy)

- Updated dependencies [[`55490c3`](https://github.com/clerk/javascript/commit/55490c31fadc82bdca6cd5f2b22e5e158aaba0cb), [`e8d21de`](https://github.com/clerk/javascript/commit/e8d21de39b591973dad48fc1d1851c4d28b162fe), [`637f2e8`](https://github.com/clerk/javascript/commit/637f2e8768b76aaf756062b6b5b44bf651f66789)]:
  - @clerk/types@4.85.0

## 3.24.2

### Patch Changes

- Add Traditional Chinese translation for sign in or up combined title ([#6701](https://github.com/clerk/javascript/pull/6701)) by [@wobsoriano](https://github.com/wobsoriano)

- Add ptBR missing localization keys for choose organization session task ([#6704](https://github.com/clerk/javascript/pull/6704)) by [@guilherme6191](https://github.com/guilherme6191)

- Updated dependencies [[`fced4fc`](https://github.com/clerk/javascript/commit/fced4fc869bb21c77826dfaf281b6640e0f0c006), [`1b1e8b1`](https://github.com/clerk/javascript/commit/1b1e8b1fd33b787f956b17b193e5fd0a4cdc6cec)]:
  - @clerk/types@4.84.1

## 3.24.1

### Patch Changes

- Refined German (de-DE) waitlist localization for improved clarity and consistency ([#6631](https://github.com/clerk/javascript/pull/6631)) by [@okikeSolutions](https://github.com/okikeSolutions)

  This update improves the waitlist flow by:
  - Updating action link text from “Jetzt anmelden” to “Anmelden”
  - Changing action text from “Kein Zugang? Auf die Warteliste setzen!” to “Bereits Zugang?”
  - Adjusting form button label from “Zur Warteliste hinzufügen” to “Warteliste beitreten”
  - Clarifying the waitlist start subtitle with instructions to enter an email for notifications
  - Aligning success subtitles with consistent wording for availability notifications

  The German waitlist localization now offers clearer guidance and a smoother user experience.

- Add api-related localizations for th-TH and refine translation context ([#6657](https://github.com/clerk/javascript/pull/6657)) by [@ttwrpz](https://github.com/ttwrpz)

- Fixed a typo when canceling a free trial. ([#6672](https://github.com/clerk/javascript/pull/6672)) by [@paddycarver](https://github.com/paddycarver)

- Updated dependencies [[`2a82737`](https://github.com/clerk/javascript/commit/2a8273705b9764e1a4613d5a0dbb738d0b156c05), [`cda5d7b`](https://github.com/clerk/javascript/commit/cda5d7b79b28dc03ec794ea54e0feb64b148cdd2), [`ba25a5b`](https://github.com/clerk/javascript/commit/ba25a5b5a3fa686a65f52e221d9d1712a389fea9), [`a50cfc8`](https://github.com/clerk/javascript/commit/a50cfc8f1dd168b436499e32fc8b0fc41d28bbff), [`377f67b`](https://github.com/clerk/javascript/commit/377f67b8e552d1a19efbe4530e9306675b7f8eab), [`65b12ee`](https://github.com/clerk/javascript/commit/65b12eeeb57ee80cdd8c36c5949d51f1227a413e), [`263722e`](https://github.com/clerk/javascript/commit/263722e61fd27403b4c8d9794880686771e123f9)]:
  - @clerk/types@4.84.0

## 3.24.0

### Minor Changes

- Complete Romanian (ro-RO) localization ([#6629](https://github.com/clerk/javascript/pull/6629)) by [@5ergiu](https://github.com/5ergiu)

  This update:
  - Translates missing API key management strings.
  - Adds complete commerce and billing translations.
  - Completes organization profile translations.
  - Adds missing error messages.
  - Includes form labels and placeholders.
  - Ensures ro-RO is included in the package.json files array for publishing.

  The Romanian localization now provides a complete experience for Romanian-speaking users.

- Improve German (de-DE) localization with all missing translations ([#6538](https://github.com/clerk/javascript/pull/6538)) by [@mwerder](https://github.com/mwerder)

  This update improves the German localization by:
  - Adding missing German translations
  - Use 'Wiederherstellungscode' instead of 'Backup-Code' in the whole file for consistency

### Patch Changes

- Updated dependencies [[`600c648`](https://github.com/clerk/javascript/commit/600c648d4087a823341041c90018797fbc0033f0)]:
  - @clerk/types@4.83.0

## 3.23.1

### Patch Changes

- Updated dependencies [[`d52714e`](https://github.com/clerk/javascript/commit/d52714e4cb7f369c74826cd4341c58eb1900abe4), [`2ed539c`](https://github.com/clerk/javascript/commit/2ed539cc7f08ed4d70c33621563ad386ea8becc5), [`c16a7a5`](https://github.com/clerk/javascript/commit/c16a7a5837fc15e0e044baf9c809b8da6fbac795)]:
  - @clerk/types@4.82.0

## 3.23.0

### Minor Changes

- [Billing Beta] Rename `cancelFreeTrialDescription` to `cancelFreeTrialAccessUntil`. ([#6582](https://github.com/clerk/javascript/pull/6582)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Update account deletion localization in zh-CN ([#6577](https://github.com/clerk/javascript/pull/6577)) by [@dearfad](https://github.com/dearfad)

- Update copies for create organization screen on session tasks ([#6584](https://github.com/clerk/javascript/pull/6584)) by [@iagodahlem](https://github.com/iagodahlem)

- Updated dependencies [[`e52bf8e`](https://github.com/clerk/javascript/commit/e52bf8ebef74a9e123c69b69acde1340c01d32d7), [`c043c19`](https://github.com/clerk/javascript/commit/c043c1919854aaa5b9cf7f6df5bb517f5617f7a1), [`c28d29c`](https://github.com/clerk/javascript/commit/c28d29c79bb4f144d782313ca72df7db91a77340), [`172e054`](https://github.com/clerk/javascript/commit/172e054a3511be12d16ba19037db320c2d9838bf)]:
  - @clerk/types@4.81.0

## 3.22.0

### Minor Changes

- Update SubscriptionDetails to support free trials ([#6569](https://github.com/clerk/javascript/pull/6569)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`8dc6bad`](https://github.com/clerk/javascript/commit/8dc6bad5c7051b59bd8c73e65d497f6a974bb1c3), [`aa6a3c3`](https://github.com/clerk/javascript/commit/aa6a3c3d3ba2de67a468c996cbf0bff43a09ddb8), [`db50c47`](https://github.com/clerk/javascript/commit/db50c4734920ada6002de8c62c994047eb6cb5a0)]:
  - @clerk/types@4.80.0

## 3.21.3

### Patch Changes

- Fix sk-SK delete confirmation text (#6547) ([#6547](https://github.com/clerk/javascript/pull/6547)) by [@l0st0](https://github.com/l0st0)

- Add error handling for `setActive` with stale organization data ([#6550](https://github.com/clerk/javascript/pull/6550)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`413468c`](https://github.com/clerk/javascript/commit/413468c9b9c8fb7576f8e4cbdccff98784e33fef), [`7b7eb1f`](https://github.com/clerk/javascript/commit/7b7eb1fc0235249c5c179239078294118f2947cd)]:
  - @clerk/types@4.79.0

## 3.21.2

### Patch Changes

- Updated dependencies [[`5b24129`](https://github.com/clerk/javascript/commit/5b24129ddcfc2f7dc6eb79d8c818b4ff97c68e9a)]:
  - @clerk/types@4.78.0

## 3.21.1

### Patch Changes

- Updated dependencies [[`4db1e58`](https://github.com/clerk/javascript/commit/4db1e58d70b60e1e236709b507666715d571e925), [`69498df`](https://github.com/clerk/javascript/commit/69498dfca3e6bb388eb8c94313eac06347dd5a27)]:
  - @clerk/types@4.77.0

## 3.21.0

### Minor Changes

- Complete Persian (fa-IR) localization with all missing translations ([#6533](https://github.com/clerk/javascript/pull/6533)) by [@hamidrezaghanbari](https://github.com/hamidrezaghanbari)

  This update completes the Persian localization by:
  - Translating all undefined API key management strings
  - Adding complete commerce/billing translations
  - Completing organization profile translations
  - Adding all missing error messages
  - Including form labels and placeholders
  - Adding fa-IR to package.json files array for proper publishing

  The Persian localization now provides a complete user experience for Persian-speaking users.

- Add support for trials in `<Checkout/>` ([#6494](https://github.com/clerk/javascript/pull/6494)) by [@panteliselef](https://github.com/panteliselef)
  - Added `freeTrialEndsAt` property to `CommerceCheckoutResource` interface.

- Update PricingTable with trial info. ([#6493](https://github.com/clerk/javascript/pull/6493)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- added missing ptBR translations ([#6503](https://github.com/clerk/javascript/pull/6503)) by [@fell-lucas](https://github.com/fell-lucas)

- Add `taskChooseOrganization` to all locales. ([#6527](https://github.com/clerk/javascript/pull/6527)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`15fe106`](https://github.com/clerk/javascript/commit/15fe1060f730a6a4391f3d2451d23edd3218e1ae), [`173837c`](https://github.com/clerk/javascript/commit/173837c2526aa826b7981ee8d6d4f52c00675da5), [`8b52d7a`](https://github.com/clerk/javascript/commit/8b52d7ae19407e8ab5a5451bd7d34b6bc38417de), [`854dde8`](https://github.com/clerk/javascript/commit/854dde88e642c47b5a29ac8f576c8c1976e5d067), [`ae2e2d6`](https://github.com/clerk/javascript/commit/ae2e2d6b336be6b596cc855e549843beb5bfd2a1), [`037f25a`](https://github.com/clerk/javascript/commit/037f25a8171888168913b186b7edf871e0aaf197), [`f8b38b7`](https://github.com/clerk/javascript/commit/f8b38b7059e498fef3ac1271346be0710aa31c76)]:
  - @clerk/types@4.76.0

## 3.20.9

### Patch Changes

- Updated dependencies [[`b72a3dd`](https://github.com/clerk/javascript/commit/b72a3dda2467720e5dc8cab3e7e6a110f3beb79b), [`d93b0ed`](https://github.com/clerk/javascript/commit/d93b0edf4adc57d48a26cb08444192887ccec659), [`6459f7d`](https://github.com/clerk/javascript/commit/6459f7dabe5f163f48ed73106bb901d8187da3e2), [`9084759`](https://github.com/clerk/javascript/commit/90847593300be605e1ee1c06dac147ce68b25dc7)]:
  - @clerk/types@4.75.0

## 3.20.8

### Patch Changes

- Introduce `TaskChooseOrganization` component which replaces `TaskSelectOrganization` with a new UI that make the experience similar to the previous `SignIn` and `SignUp` steps ([#6446](https://github.com/clerk/javascript/pull/6446)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`1ad16da`](https://github.com/clerk/javascript/commit/1ad16daa49795a861ae277001831230580b6b9f4), [`4edef81`](https://github.com/clerk/javascript/commit/4edef81dd423a0471e3f579dd6b36094aa8546aa), [`696f8e1`](https://github.com/clerk/javascript/commit/696f8e11a3e5391e6b5a97d98e929b8973575b9a), [`f318d22`](https://github.com/clerk/javascript/commit/f318d22cf83caaef272bcf532561a03ca72575e7)]:
  - @clerk/types@4.74.0

## 3.20.7

### Patch Changes

- Add types for `form_param_type_invalid` errors. ([#6457](https://github.com/clerk/javascript/pull/6457)) by [@dstaley](https://github.com/dstaley)

- Updated dependencies [[`f93965f`](https://github.com/clerk/javascript/commit/f93965f64c81030f9fcf9d1cc4e4984d30cd12ec), [`7b6dcee`](https://github.com/clerk/javascript/commit/7b6dceea5bfd7f1cc1bf24126aa715307e24ae7f)]:
  - @clerk/types@4.73.0

## 3.20.6

### Patch Changes

- Add ja-JP translations in `<UserProfile/>`. ([#6426](https://github.com/clerk/javascript/pull/6426)) by [@tsume-ha](https://github.com/tsume-ha)

- Refactor billing statement page and payment attempt page data loading ([#6420](https://github.com/clerk/javascript/pull/6420)) by [@aeliox](https://github.com/aeliox)

- Updated dependencies [[`22c35ef`](https://github.com/clerk/javascript/commit/22c35efb59226df2efaa2891fa4775c13312f4c6), [`e8d816a`](https://github.com/clerk/javascript/commit/e8d816a3350e862c3e9e1d4f8c96c047a0a016a2), [`aa9f185`](https://github.com/clerk/javascript/commit/aa9f185e21b58f8a6e03ea44ce29ee09ad2477d9), [`af0e123`](https://github.com/clerk/javascript/commit/af0e12393c9412281626e20dafb1b3a15558f6d9), [`3d1d871`](https://github.com/clerk/javascript/commit/3d1d8711405646cf3c2aabe99e08337a1028703a)]:
  - @clerk/types@4.72.0

## 3.20.5

### Patch Changes

- Updated dependencies [[`e404456`](https://github.com/clerk/javascript/commit/e4044566bca81f63c8e9c630fdec0f498ad6fc08), [`d58b959`](https://github.com/clerk/javascript/commit/d58b9594cf65158e87dbaa90d632c45f543373e1), [`822ba1f`](https://github.com/clerk/javascript/commit/822ba1fd5e7daf665120cf183e4600a227098d53), [`d4d2612`](https://github.com/clerk/javascript/commit/d4d2612483baf356c389ef0ba5084059025481f2)]:
  - @clerk/types@4.71.0

## 3.20.4

### Patch Changes

- Updated dependencies [[`b0fdc9e`](https://github.com/clerk/javascript/commit/b0fdc9eaf764ca0c17cbe0810b7d240f6d9db0b6)]:
  - @clerk/types@4.70.1

## 3.20.3

### Patch Changes

- Updated dependencies [[`cd59c0e`](https://github.com/clerk/javascript/commit/cd59c0e5512a341dd8fb420aca583333c8243aa5)]:
  - @clerk/types@4.70.0

## 3.20.2

### Patch Changes

- Refine Traditional Chinese (`zh-TW`) translations ([#5683](https://github.com/clerk/javascript/pull/5683)) by [@anilahsu](https://github.com/anilahsu)

- Add Persian (`fa-IR`) language ([#6063](https://github.com/clerk/javascript/pull/6063)) by [@XerxesCoder](https://github.com/XerxesCoder)

- Extend `ru-RU` localization ([#5698](https://github.com/clerk/javascript/pull/5698)) by [@ZharaskhanAman](https://github.com/ZharaskhanAman)

- feat(localizations): Update `sk-SK` localization ([#5497](https://github.com/clerk/javascript/pull/5497)) by [@radblesk](https://github.com/radblesk)

- Add `sr-RS` to the list of exported and available localizations ([#6352](https://github.com/clerk/javascript/pull/6352)) by [@tmilewski](https://github.com/tmilewski)

- feat(localization): Add Hindi, Bengali, Tamil, Telugu, and Malay language support ([#5534](https://github.com/clerk/javascript/pull/5534)) by [@vanikya](https://github.com/vanikya)

- Add missing French locales to support new Clerk's Billing feature ([#5944](https://github.com/clerk/javascript/pull/5944)) by [@bde-maze](https://github.com/bde-maze)

- chore(localizations): Align `en-US` strings for danger zone with other translations ([#5800](https://github.com/clerk/javascript/pull/5800)) by [@joschi](https://github.com/joschi)

- Add Kazakh (kk-KZ) language ([#5684](https://github.com/clerk/javascript/pull/5684)) by [@azekowka](https://github.com/azekowka)

- Update `es-MX` translations ([#5663](https://github.com/clerk/javascript/pull/5663)) by [@LFCisneros](https://github.com/LFCisneros)

- Add Italian translations related to commerce and api keys. ([#6362](https://github.com/clerk/javascript/pull/6362)) by [@matteoblonde](https://github.com/matteoblonde)

- Updated dependencies [[`fecc99d`](https://github.com/clerk/javascript/commit/fecc99d43cb7db5b99863829acb234cbce0da264), [`10e1060`](https://github.com/clerk/javascript/commit/10e10605b18a58f33a93caed058159c190678e74), [`92c44dd`](https://github.com/clerk/javascript/commit/92c44dd9d51e771a928a8da7004bdb8f8bdbaf58), [`a04a8f5`](https://github.com/clerk/javascript/commit/a04a8f5f81241ee41d93cd64793beca9d6296abb), [`c61855c`](https://github.com/clerk/javascript/commit/c61855c51d9c129d48c4543da3719939ad82f623), [`43ea069`](https://github.com/clerk/javascript/commit/43ea069c570dc64503fc82356ad28a2e43689d45)]:
  - @clerk/types@4.69.0

## 3.20.1

### Patch Changes

- Expand `vi-VN` localizations ([#6185](https://github.com/clerk/javascript/pull/6185)) by [@namnguyenthanhwork](https://github.com/namnguyenthanhwork)

## 3.20.0

### Minor Changes

- Improve invalid plan change callout for monthly-only plans ([#6248](https://github.com/clerk/javascript/pull/6248)) by [@aeliox](https://github.com/aeliox)

### Patch Changes

- Updated dependencies [[`d2f6f9e`](https://github.com/clerk/javascript/commit/d2f6f9e02036a4288916fcce14f24be5d56561c4), [`a329836`](https://github.com/clerk/javascript/commit/a329836a6c64f0a551a277ccae07043456a70523), [`6041c39`](https://github.com/clerk/javascript/commit/6041c39a31e787a6065dbc3f21e1c569982a06de), [`3f1270d`](https://github.com/clerk/javascript/commit/3f1270db86a21ead0ed6f0bd4f9986485203e973)]:
  - @clerk/types@4.68.0

## 3.19.2

### Patch Changes

- Updated dependencies [[`2a90b68`](https://github.com/clerk/javascript/commit/2a90b689550ae960496c9292ca23e0225e3425cd)]:
  - @clerk/types@4.67.0

## 3.19.1

### Patch Changes

- Updated dependencies [[`8ee859c`](https://github.com/clerk/javascript/commit/8ee859ce00d1d5747c14a80fe7166303e64a4f1f)]:
  - @clerk/types@4.66.1

## 3.19.0

### Minor Changes

- Display past due subscriptions properly. ([#6309](https://github.com/clerk/javascript/pull/6309)) by [@panteliselef](https://github.com/panteliselef)

- Extract `SubscriptionDetails`, into its own internal component, out of existing (also internal) `PlanDetails` component. ([#6148](https://github.com/clerk/javascript/pull/6148)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`025e304`](https://github.com/clerk/javascript/commit/025e304c4d6402dfd750ee51ac9c8fc2dea1f353), [`dedf487`](https://github.com/clerk/javascript/commit/dedf48703986d547d5b28155b0182a51030cffeb), [`b96114e`](https://github.com/clerk/javascript/commit/b96114e438638896ba536bb7a17b09cdadcd9407)]:
  - @clerk/types@4.66.0

## 3.18.1

### Patch Changes

- Updated dependencies [[`2be6a53`](https://github.com/clerk/javascript/commit/2be6a53959cb8a3127c2eb5d1aeb4248872d2c24), [`6826d0b`](https://github.com/clerk/javascript/commit/6826d0bbd03e844d49224565878a4326684f06b4), [`f6a1c35`](https://github.com/clerk/javascript/commit/f6a1c35bd5fb4bd2a3cd45bdaf9defe6be59d4a9)]:
  - @clerk/types@4.65.0

## 3.18.0

### Minor Changes

- Add missing Portuguese pt-BR locales for the statements elements ([#6222](https://github.com/clerk/javascript/pull/6222)) by [@lightapps-smart-blocks](https://github.com/lightapps-smart-blocks)

### Patch Changes

- Updated dependencies [[`f42c4fe`](https://github.com/clerk/javascript/commit/f42c4fedfdab873129b876eba38b3677f190b460), [`ec207dc`](https://github.com/clerk/javascript/commit/ec207dcd2a13340cfa4e3b80d3d52d1b4e7d5f23)]:
  - @clerk/types@4.64.0

## 3.17.3

### Patch Changes

- Generate placeholder API keys locales ([#6223](https://github.com/clerk/javascript/pull/6223)) by [@wobsoriano](https://github.com/wobsoriano)

- Include `esCR` in the package's exports ([#6207](https://github.com/clerk/javascript/pull/6207)) by [@beerose](https://github.com/beerose)

- Updated dependencies [[`8387a39`](https://github.com/clerk/javascript/commit/8387a392a04906f0f10d84c61cfee36f23942f85), [`f2a6641`](https://github.com/clerk/javascript/commit/f2a66419b1813abc86ea98fde7475861995a1486)]:
  - @clerk/types@4.63.0

## 3.17.2

### Patch Changes

- Updated dependencies [[`edc0bfd`](https://github.com/clerk/javascript/commit/edc0bfdae929dad78a99dfd6275aad947d9ddd73)]:
  - @clerk/types@4.62.1

## 3.17.1

### Patch Changes

- Add missing Portuguese pt-BR locales for the billing elements. ([#6058](https://github.com/clerk/javascript/pull/6058)) by [@lightapps-smart-blocks](https://github.com/lightapps-smart-blocks)

- Updated dependencies [[`f1be1fe`](https://github.com/clerk/javascript/commit/f1be1fe3d575c11acd04fc7aadcdec8f89829894), [`bffb42a`](https://github.com/clerk/javascript/commit/bffb42aaf266a188b9ae7d16ace3024d468a3bd4)]:
  - @clerk/types@4.62.0

## 3.17.0

### Minor Changes

- Add `es-CR` localizations ([#6178](https://github.com/clerk/javascript/pull/6178)) by [@LFCisneros](https://github.com/LFCisneros)

### Patch Changes

- Add legal consent related localization to `ja-JP` ([#5886](https://github.com/clerk/javascript/pull/5886)) by [@sdaigo](https://github.com/sdaigo)

- Replace expiration segmented list with dropdown and hide description field in `<APIKeys />` component ([#6153](https://github.com/clerk/javascript/pull/6153)) by [@wobsoriano](https://github.com/wobsoriano)

- Fix errors in `es-CR` ([#6181](https://github.com/clerk/javascript/pull/6181)) by [@tmilewski](https://github.com/tmilewski)

- Adds clickable Terms of Service and Privacy Policy links to the following localizations: `be-BY`, `bg-BG`, `cs-CZ`, `es-ES`, `it-IT`, `nl-BE`, `nl-NL`, `pt-PT`, and `tr-TR`. ([#6135](https://github.com/clerk/javascript/pull/6135)) by [@tmilewski](https://github.com/tmilewski)

- Updated dependencies [[`b495279`](https://github.com/clerk/javascript/commit/b4952796e3c7dee4ab4726de63a17b7f4265ce37), [`c3fa15d`](https://github.com/clerk/javascript/commit/c3fa15d60642b4fcbcf26e21caaca0fc60975795), [`52d5e57`](https://github.com/clerk/javascript/commit/52d5e5768d54725b4d20d028135746493e05d44c), [`15a945c`](https://github.com/clerk/javascript/commit/15a945c02a9f6bc8d2f7d1e3534217100bf45936)]:
  - @clerk/types@4.61.0

## 3.16.5

### Patch Changes

- Add payment history tab to UserProfile and OrgProfile ([#6075](https://github.com/clerk/javascript/pull/6075)) by [@aeliox](https://github.com/aeliox)

- Add TypeScript types and en-US localization for upcoming `<APIKeys />` component. This component will initially be in early access. ([#5858](https://github.com/clerk/javascript/pull/5858)) by [@wobsoriano](https://github.com/wobsoriano)

- Add localizations for some commerce strings, general cleanups ([#6101](https://github.com/clerk/javascript/pull/6101)) by [@aeliox](https://github.com/aeliox)

- Introduce `commerce.checkout.pastDueNotice` localization key. ([#6097](https://github.com/clerk/javascript/pull/6097)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`19e9e11`](https://github.com/clerk/javascript/commit/19e9e11af04f13fd12975fbf7016fe0583202056), [`18bcb64`](https://github.com/clerk/javascript/commit/18bcb64a3e8b6d352d7933ed094d68214e6e80fb), [`138f733`](https://github.com/clerk/javascript/commit/138f733f13121487268a4f96e6eb2cffedc6e238), [`48be55b`](https://github.com/clerk/javascript/commit/48be55b61a86e014dd407414764d24bb43fd26f3), [`2c6f805`](https://github.com/clerk/javascript/commit/2c6f805a9e6e4685990f9a8abc740b2d0859a453), [`97749d5`](https://github.com/clerk/javascript/commit/97749d570bc687c7e05cd800a50e0ae4180a371d)]:
  - @clerk/types@4.60.1

## 3.16.4

### Patch Changes

- Update Spanish (es-ES) password validation messages to match new English (en-US) format ([#6048](https://github.com/clerk/javascript/pull/6048)) by [@ReyserLyn](https://github.com/ReyserLyn)

- Updated dependencies [[`d8fa5d9`](https://github.com/clerk/javascript/commit/d8fa5d9d3d8dc575260d8d2b7c7eeeb0052d0b0d), [`be2e89c`](https://github.com/clerk/javascript/commit/be2e89ca11aa43d48f74c57a5a34e20d85b4003c), [`5644d94`](https://github.com/clerk/javascript/commit/5644d94f711a0733e4970c3f15c24d56cafc8743), [`b578225`](https://github.com/clerk/javascript/commit/b5782258242474c9b0987a3f8349836cd763f24b), [`8838120`](https://github.com/clerk/javascript/commit/8838120596830b88fec1c6c853371dabfec74a0d)]:
  - @clerk/types@4.60.0

## 3.16.3

### Patch Changes

- Add "Past Due" amount on checkout flow when applicable ([#6014](https://github.com/clerk/javascript/pull/6014)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`2c6a0cc`](https://github.com/clerk/javascript/commit/2c6a0cca6e824bafc6b0d0501784517a5b1f75ea), [`71e6a1f`](https://github.com/clerk/javascript/commit/71e6a1f1024d65b7a09cdc8fa81ce0164e0a34cb)]:
  - @clerk/types@4.59.3

## 3.16.2

### Patch Changes

- Improve de-DE localizations for "Clerk Billing" ([#6011](https://github.com/clerk/javascript/pull/6011)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`6ed3dfc`](https://github.com/clerk/javascript/commit/6ed3dfc1bc742ac9d9a2307fe8e4733411cbc0d7)]:
  - @clerk/types@4.59.2

## 3.16.1

### Patch Changes

- Add support for country-specific alternative phone code channels ([#5937](https://github.com/clerk/javascript/pull/5937)) by [@anagstef](https://github.com/anagstef)

- Updated dependencies [[`c305b31`](https://github.com/clerk/javascript/commit/c305b310e351e9ce2012f805b35e464c3e43e310)]:
  - @clerk/types@4.59.1

## 3.16.0

### Minor Changes

- Replaces strings with localizations throughout billing components. ([#5922](https://github.com/clerk/javascript/pull/5922)) by [@alexcarpenter](https://github.com/alexcarpenter)

### Patch Changes

- Updated dependencies [[`b1337df`](https://github.com/clerk/javascript/commit/b1337dfeae8ccf8622efcf095e3201f9bbf1cefa), [`65f0878`](https://github.com/clerk/javascript/commit/65f08788ee5e56242eee2194c73ba90965c75c97), [`df6fefd`](https://github.com/clerk/javascript/commit/df6fefd05fd2df93f5286d97e546b48911adea7c), [`4282bfa`](https://github.com/clerk/javascript/commit/4282bfa09491225bde7d619fe9a3561062703f69), [`5491491`](https://github.com/clerk/javascript/commit/5491491711e0a8ee37828451c1f603a409de32cf)]:
  - @clerk/types@4.59.0

## 3.15.3

### Patch Changes

- Add "Clerk Billing" related translations to de-DE ([#5892](https://github.com/clerk/javascript/pull/5892)) by [@LekoArts](https://github.com/LekoArts)

- Introduce `WhatsApp` as an alternative channel for phone code delivery. ([#5894](https://github.com/clerk/javascript/pull/5894)) by [@anagstef](https://github.com/anagstef)

  The new `channel` property accompanies the `phone_code` strategy. Possible values: `whatsapp` and `sms`.

- Add signIn related translation to ja-JP ([#5915](https://github.com/clerk/javascript/pull/5915)) by [@shogo-nakano-desu](https://github.com/shogo-nakano-desu)

- Export mnMn localization files ([#5907](https://github.com/clerk/javascript/pull/5907)) by [@tmilewski](https://github.com/tmilewski)

- Display a better subscription list / button when empty and the free plan is hidden ([#5912](https://github.com/clerk/javascript/pull/5912)) by [@aeliox](https://github.com/aeliox)

- Updated dependencies [[`1ff6d6e`](https://github.com/clerk/javascript/commit/1ff6d6efbe838b3f7f6977b2b5215c2cafd715f6), [`fbf3cf4`](https://github.com/clerk/javascript/commit/fbf3cf4916469c4e118870bf12efca2d0f77d9d8)]:
  - @clerk/types@4.58.1

## 3.15.2

### Patch Changes

- Added a notice in tooltip when member no has permissions to manage billing for all manager related buttons ([#5852](https://github.com/clerk/javascript/pull/5852)) by [@octoper](https://github.com/octoper)

- Update profile components plans page heading from `Switch plans` to `Plans` ([#5889](https://github.com/clerk/javascript/pull/5889)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`0f5145e`](https://github.com/clerk/javascript/commit/0f5145e164f3d3d5faf57e58162b05e7110d2403), [`afdfd18`](https://github.com/clerk/javascript/commit/afdfd18d645608dec37e52a291a91ba5f42dcbe7), [`b7c51ba`](https://github.com/clerk/javascript/commit/b7c51baac6df1129b468274c9a7f63ca303f16ce), [`437b53b`](https://github.com/clerk/javascript/commit/437b53b67e281d076b5b3f927e11c1d64666d154), [`5217155`](https://github.com/clerk/javascript/commit/52171554250c5c58f4f497b6d3c7416e79ac77da)]:
  - @clerk/types@4.58.0

## 3.15.1

### Patch Changes

- Update PricingTable badge and status messaging. ([#5844](https://github.com/clerk/javascript/pull/5844)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Add new Billing Statements UI to User and Org Profile ([#5850](https://github.com/clerk/javascript/pull/5850)) by [@aeliox](https://github.com/aeliox)

- Show annual amount in the subscriptions list if the subscription has annual plan period ([#5863](https://github.com/clerk/javascript/pull/5863)) by [@octoper](https://github.com/octoper)

- Update `PricingTable` plan card UI ([#5844](https://github.com/clerk/javascript/pull/5844)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Update `<Checkout />` line items to include `x12` prefix when plan is annual ([#5857](https://github.com/clerk/javascript/pull/5857)) by [@nikospapcom](https://github.com/nikospapcom)

- Updated dependencies [[`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`36fb43f`](https://github.com/clerk/javascript/commit/36fb43f8b35866bdc20680fac58020f036d30d1f), [`e5ac444`](https://github.com/clerk/javascript/commit/e5ac4447f52bb6887ad686feab308fe9daf76e33), [`4db96e0`](https://github.com/clerk/javascript/commit/4db96e0ff2ab44c7bdd8540e09ec70b84b19d3eb), [`d227805`](https://github.com/clerk/javascript/commit/d22780599a5e29545a3d8309cc411c2e8659beac)]:
  - @clerk/types@4.57.1

## 3.15.0

### Minor Changes

- Rely on API-based error messaging for `en-US` localizations ([#5809](https://github.com/clerk/javascript/pull/5809)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Only allow members with `org:sys_billing:manage` to manage billing for an Organization ([#5835](https://github.com/clerk/javascript/pull/5835)) by [@octoper](https://github.com/octoper)

- Move `<__experimental_PaymentSources />` component under `Billing` -> `Subscriptions` tab and delete `Payment methods` tab ([#5825](https://github.com/clerk/javascript/pull/5825)) by [@nikospapcom](https://github.com/nikospapcom)

- Adjusts the layout of the `PricingTable` plan cards ([#5824](https://github.com/clerk/javascript/pull/5824)) by [@aeliox](https://github.com/aeliox)

- Allow switching from an existing monthly subscription to an annual subscription for the same plan ([#5811](https://github.com/clerk/javascript/pull/5811)) by [@aeliox](https://github.com/aeliox)

- Update SubscriptionsList UI to be rendered within ProfileSections within UserProfile and OrganizationProfile. ([#5847](https://github.com/clerk/javascript/pull/5847)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Update checkout downgrade notice placement and text. ([#5837](https://github.com/clerk/javascript/pull/5837)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Add `Pay with test card` button on `<AddPaymentSource />` component in dev instance ([#5831](https://github.com/clerk/javascript/pull/5831)) by [@nikospapcom](https://github.com/nikospapcom)

- Updated dependencies [[`db0138f`](https://github.com/clerk/javascript/commit/db0138f3f72aea8cb68a5684a90123f733848f63), [`aa97231`](https://github.com/clerk/javascript/commit/aa97231962e3f472a46135e376159c6ddcf1157b), [`c792f37`](https://github.com/clerk/javascript/commit/c792f37129fd6475d5af95146e9ef0f1c8eff730), [`3bf08a9`](https://github.com/clerk/javascript/commit/3bf08a9e0a9e65496edac5fc3bb22ad7b561df26), [`74cf3b2`](https://github.com/clerk/javascript/commit/74cf3b28cdf622a942aaf99caabfba74b7e856fd), [`037b113`](https://github.com/clerk/javascript/commit/037b113aaedd53d4647d88f1659eb9c14cf6f275), [`c15a412`](https://github.com/clerk/javascript/commit/c15a412169058e2304a51c9e92ffaa7f6bb2a898), [`7726a03`](https://github.com/clerk/javascript/commit/7726a03a7fec4d292b6de2587b84ed4371984c23), [`b846a9a`](https://github.com/clerk/javascript/commit/b846a9ab96db6b1d8344a4b693051618865508a8), [`e66c800`](https://github.com/clerk/javascript/commit/e66c8002b82b2902f77e852e16482f5cfb062d2c), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed), [`9c41091`](https://github.com/clerk/javascript/commit/9c41091eb795bce8ffeeeca0264ae841fe07b426), [`29462b4`](https://github.com/clerk/javascript/commit/29462b433eb411ce614e4768e5844cacd00c1975), [`322c43f`](https://github.com/clerk/javascript/commit/322c43f6807a932c3cfaaef1b587b472c80180d2), [`17397f9`](https://github.com/clerk/javascript/commit/17397f95b715bd4fefd7f63c1d351abcf1c8ee16), [`45e8298`](https://github.com/clerk/javascript/commit/45e829890ec9ac66f07e0d7076cd283f14c893ed)]:
  - @clerk/types@4.57.0

## 3.14.4

### Patch Changes

- Updated dependencies [[`9ec0a73`](https://github.com/clerk/javascript/commit/9ec0a7353e9f6ea661c3d7b9542423b6eb1d29e9), [`d9222fc`](https://github.com/clerk/javascript/commit/d9222fc3c21da2bcae30b06f0b1897f526935582)]:
  - @clerk/types@4.56.3

## 3.14.3

### Patch Changes

- Updated dependencies [[`225b9ca`](https://github.com/clerk/javascript/commit/225b9ca21aba44930872a85d6b112ee2a1b606b9)]:
  - @clerk/types@4.56.2

## 3.14.2

### Patch Changes

- Updated dependencies [[`387bf62`](https://github.com/clerk/javascript/commit/387bf623406306e0c5c08da937f4930a7ec5e4a5), [`294da82`](https://github.com/clerk/javascript/commit/294da82336e7a345900d7ef9b28f56a7c8864c52)]:
  - @clerk/types@4.56.1

## 3.14.1

### Patch Changes

- - Break out subscriptions and plans into different pages within `UserProfile` and `OrgProfile` ([#5727](https://github.com/clerk/javascript/pull/5727)) by [@aeliox](https://github.com/aeliox)

  - Display free plan row when "active" and plan has features
  - Tidy up design of subscription rows and badging
  - Adds `SubscriptionDetails` support for plans without a current subscription

- Switch to "Payment method" terminology instead of "Payment source". ([#5721](https://github.com/clerk/javascript/pull/5721)) by [@panteliselef](https://github.com/panteliselef)
  - Removes `userProfile.__experimental_billingPage.start.headerTitle__paymentSources`
  - Adds `userProfile.__experimental_billingPage.start.headerTitle__paymentMethods`

- Updated dependencies [[`b02e766`](https://github.com/clerk/javascript/commit/b02e76627e47aec314573586451fa345a089115a), [`5d78b28`](https://github.com/clerk/javascript/commit/5d78b286b63e35fbcf44aac1f7657cbeaba4d659), [`d7f4438`](https://github.com/clerk/javascript/commit/d7f4438fa4bfd04474d5cdb9212ba908568ad6d2), [`5866855`](https://github.com/clerk/javascript/commit/58668550ec91d5511cf775972c54dc485185cc58), [`0007106`](https://github.com/clerk/javascript/commit/00071065998a3676c51e396b4c0afcbf930a9898), [`462b5b2`](https://github.com/clerk/javascript/commit/462b5b271d4e120d58a85818a358b60a6b3c8100), [`447d7a9`](https://github.com/clerk/javascript/commit/447d7a9e133c2a0e7db014bd5837e6ffff08f572), [`2beea29`](https://github.com/clerk/javascript/commit/2beea2957c67bc62446fe24d36332b0a4e850d7d), [`115601d`](https://github.com/clerk/javascript/commit/115601d12fd65dbf3011c0cda368525a2b95bfeb)]:
  - @clerk/types@4.56.0

## 3.14.0

### Minor Changes

- Remove `not_allowed_access` localizations from `en_*` localization files to rely on more-specific API-based error messages. ([#5701](https://github.com/clerk/javascript/pull/5701)) by [@tmilewski](https://github.com/tmilewski)

  Update and translate additional non-english `not_allowed_access` error messages.

### Patch Changes

- Simplify `form_identifier_not_found` localization to "We couldn't find an account with those details." ([#5700](https://github.com/clerk/javascript/pull/5700)) by [@tmilewski](https://github.com/tmilewski)

## 3.13.14

### Patch Changes

- Make the `session_exists` error message more user-friendly and localize ([#5699](https://github.com/clerk/javascript/pull/5699)) by [@tmilewski](https://github.com/tmilewski)

- Updated dependencies [[`8b25035`](https://github.com/clerk/javascript/commit/8b25035aa49382fe1cd1c6f30ec80e86bcf9d66e)]:
  - @clerk/types@4.55.1

## 3.13.13

### Patch Changes

- Account for all possible cases from `not_allowed_access` error codes ([#5688](https://github.com/clerk/javascript/pull/5688)) by [@tmilewski](https://github.com/tmilewski)

- - Adds support for collecting and verifying user email (when they don't already have one associated with their payer) during checkout ([#5671](https://github.com/clerk/javascript/pull/5671)) by [@aeliox](https://github.com/aeliox)

  - Fixes incorrect org invoices endpoint.
  - Extracts plan CTA button styling, labeling, and selecting into context methods.
  - Adds UserProfile / OrgProfile specific scrollbox IDs for drawer portal-ing (fixes issue where both could be open)
  - Fixes incorrect button action in SubscriptionList for active but expiring subscriptions.

- Add `<SubscriptionsList />` to both UserProfile and OrgProfile components. ([#5658](https://github.com/clerk/javascript/pull/5658)) by [@alexcarpenter](https://github.com/alexcarpenter)

  Introduce experimental method for opening `<SubscriptionDetails />` component.

  ```tsx
  clerk.__experimental_openSubscriptionDetails(...)
  ```

- Updated dependencies [[`33201bf`](https://github.com/clerk/javascript/commit/33201bf972d6a980617d47ebd776bef76f871833), [`4334598`](https://github.com/clerk/javascript/commit/4334598108ff2cfa3c25b5a46117c1c9c65b7974), [`0ae0403`](https://github.com/clerk/javascript/commit/0ae040303d239b75a3221436354a2c2ecdb85aae)]:
  - @clerk/types@4.55.0

## 3.13.12

### Patch Changes

- Add Spanish translations for email and password inputs ([#5657](https://github.com/clerk/javascript/pull/5657)) by [@LFCisneros](https://github.com/LFCisneros)

- Updated dependencies [[`45486ac`](https://github.com/clerk/javascript/commit/45486acebf4d133efb09a3622a738cdbf4e51d66), [`837692a`](https://github.com/clerk/javascript/commit/837692aa40197b1574783ad36d0d017a771c08e1), [`0c00e59`](https://github.com/clerk/javascript/commit/0c00e59ff4714491650ac9480ae3b327c626d30d), [`6a5f644`](https://github.com/clerk/javascript/commit/6a5f6447a36a635d6201f8bb7619fb844ab21b79)]:
  - @clerk/types@4.54.2

## 3.13.11

### Patch Changes

- Chore: tidy up checkout complete state for upcoming subscriptions ([#5644](https://github.com/clerk/javascript/pull/5644)) by [@aeliox](https://github.com/aeliox)

- Fix German account deletion confirmation ([#5624](https://github.com/clerk/javascript/pull/5624)) by [@hansemannn](https://github.com/hansemannn)

- Updates `PricingTable` and `SubscriptionDetailDrawer` to handle `upcoming` and "expiring" subscriptions. ([#5601](https://github.com/clerk/javascript/pull/5601)) by [@aeliox](https://github.com/aeliox)

- Updated dependencies [[`ab939fd`](https://github.com/clerk/javascript/commit/ab939fdb29150c376280b42f861a188a33f57dcc), [`03284da`](https://github.com/clerk/javascript/commit/03284da6a93a790ce3e3ebbd871c06e19f5a8803), [`7389ba3`](https://github.com/clerk/javascript/commit/7389ba3164ca0d848fb0a9de5d7e9716925fadcc), [`f6ef841`](https://github.com/clerk/javascript/commit/f6ef841125ff21ca8cae731d1f47f3a101d887e1), [`e634830`](https://github.com/clerk/javascript/commit/e6348301ab56a7868f24c1b9a4dd9e1d60f6027b), [`f8887b2`](https://github.com/clerk/javascript/commit/f8887b2cbd145e8e49bec890e8b6e02e34178d6a)]:
  - @clerk/types@4.54.1

## 3.13.10

### Patch Changes

- Updated dependencies [[`e4d04ae`](https://github.com/clerk/javascript/commit/e4d04aea490ab67e3431729398d3f4c46fc3e7e7), [`431a821`](https://github.com/clerk/javascript/commit/431a821b590835bcf6193a4cbdd234c5e763e08c), [`93068ea`](https://github.com/clerk/javascript/commit/93068ea9eb19d8c8b9c7ade35d0cd860e08049fc), [`48438b4`](https://github.com/clerk/javascript/commit/48438b409036088701bda7e1e732d6a51bee8cdc), [`196dcb4`](https://github.com/clerk/javascript/commit/196dcb47928bd22a3382197f8594a590f688faee)]:
  - @clerk/types@4.54.0

## 3.13.9

### Patch Changes

- Improve the CAPTCHA error message to better assist users ([#5577](https://github.com/clerk/javascript/pull/5577)) by [@anagstef](https://github.com/anagstef)

- Updated dependencies [[`554242e`](https://github.com/clerk/javascript/commit/554242e16e50c92a6afb6ed74c681b04b9f113b5)]:
  - @clerk/types@4.53.0

## 3.13.8

### Patch Changes

- Updated dependencies [[`3ad3bc8`](https://github.com/clerk/javascript/commit/3ad3bc8380b354b0cd952eb58eb6c07650efa0f2), [`cfa94b8`](https://github.com/clerk/javascript/commit/cfa94b88476608edf8c2486e8ec0d3f3f82e0bfb), [`2033919`](https://github.com/clerk/javascript/commit/203391964857b98dae11944799d1e6328439e838), [`5f3cc46`](https://github.com/clerk/javascript/commit/5f3cc460b6b775b5a74746758b8cff11649a877a)]:
  - @clerk/types@4.52.0

## 3.13.7

### Patch Changes

- Updated dependencies [[`f6f275d`](https://github.com/clerk/javascript/commit/f6f275dac5ae83ac0c2016a85a6a0cee9513f224)]:
  - @clerk/types@4.51.1

## 3.13.6

### Patch Changes

- feat(localizations): Add waitlist values for es-MX ([#5392](https://github.com/clerk/javascript/pull/5392)) by [@Gledros](https://github.com/Gledros)

- Improve `de-DE` localization by defining previously `undefined` values ([#5508](https://github.com/clerk/javascript/pull/5508)) by [@vaihtovirta](https://github.com/vaihtovirta)

- Updated dependencies [[`e1ec52b`](https://github.com/clerk/javascript/commit/e1ec52b93038c9cb24e030dc06e53825a384a480), [`bebb6d8`](https://github.com/clerk/javascript/commit/bebb6d8af66b2bb7a4b3bdf96f9d480e65b31ba2), [`d0d5203`](https://github.com/clerk/javascript/commit/d0d5203e4ee9e2e1bed5c00ef0f87f0130f1d298), [`9b25e31`](https://github.com/clerk/javascript/commit/9b25e311cf5e15f896c7948faa42ace45df364c5)]:
  - @clerk/types@4.51.0

## 3.13.5

### Patch Changes

- Update fr-FR TOS/privacy policy loclization to include the appropriate links. ([#5511](https://github.com/clerk/javascript/pull/5511)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Add payment source section to `UserProfile` ([#5492](https://github.com/clerk/javascript/pull/5492)) by [@aeliox](https://github.com/aeliox)

- Updated dependencies [[`ec4521b`](https://github.com/clerk/javascript/commit/ec4521b4fe56602f524a0c6d1b09d21aef5d8bd0), [`f30fa75`](https://github.com/clerk/javascript/commit/f30fa750754f19030f932a666d2bdbdf0d86743d), [`9c68678`](https://github.com/clerk/javascript/commit/9c68678e87047e6312b708b775ebfb23a3e22f8a)]:
  - @clerk/types@4.50.2

## 3.13.4

### Patch Changes

- Add billing page to `OrgProfile`, use new `usePlans` hook, and adds new subscription methods ([#5423](https://github.com/clerk/javascript/pull/5423)) by [@aeliox](https://github.com/aeliox)

- Updated dependencies [[`e20fb6b`](https://github.com/clerk/javascript/commit/e20fb6b397fb69c9d5af4e321267b82f12a5f127), [`77e6462`](https://github.com/clerk/javascript/commit/77e64628560cab688af214edb5922e67cd68a951)]:
  - @clerk/types@4.50.1

## 3.13.3

### Patch Changes

- Defines that the current password should be entered on password re-verifcation flow ([#5455](https://github.com/clerk/javascript/pull/5455)) by [@octoper](https://github.com/octoper)

- Updated dependencies [[`1da28a2`](https://github.com/clerk/javascript/commit/1da28a28bf602069b433c15b92df21f682779294), [`f20dc15`](https://github.com/clerk/javascript/commit/f20dc159f542449e7f5b437b70d3eb3ba04d6975), [`4d9f1ee`](https://github.com/clerk/javascript/commit/4d9f1ee8c22fe1e4a166ff054d0af4d37b829f0a)]:
  - @clerk/types@4.50.0

## 3.13.2

### Patch Changes

- Updated dependencies [[`466ed13`](https://github.com/clerk/javascript/commit/466ed136af73b59b267d92ad3296039d1c3a4fcc)]:
  - @clerk/types@4.49.2

## 3.13.1

### Patch Changes

- Updated dependencies [[`3910ebe`](https://github.com/clerk/javascript/commit/3910ebea85817273f18fd2f3f142dd1c728e2220)]:
  - @clerk/types@4.49.1

## 3.13.0

### Minor Changes

- Allow user set primary web3 wallet in `<UserProfile />` when more than one web3 wallets presented ([#5353](https://github.com/clerk/javascript/pull/5353)) by [@nikospapcom](https://github.com/nikospapcom)

### Patch Changes

- Introduce experimental billing APIs and components ([#5248](https://github.com/clerk/javascript/pull/5248)) by [@aeliox](https://github.com/aeliox)

- Updated dependencies [[`725918d`](https://github.com/clerk/javascript/commit/725918df2e74cea15e9b748aaf103a52df8e8500), [`91d0f0b`](https://github.com/clerk/javascript/commit/91d0f0b0dccab7168ad4dc06c8629808938c235f), [`9572bf5`](https://github.com/clerk/javascript/commit/9572bf5bdfb7dc309ec8714989b98ab12174965b), [`39bbc51`](https://github.com/clerk/javascript/commit/39bbc5189a33dc6cebdc269ac2184dc4ffff2534), [`3dddcda`](https://github.com/clerk/javascript/commit/3dddcda191d8f8d6a9b02464f1f6374d3c6aacb9), [`7524943`](https://github.com/clerk/javascript/commit/7524943300d7e693d61cc1820b520abfadec1c64), [`150b5c8`](https://github.com/clerk/javascript/commit/150b5c89477abb0feab15e0a886179473f653cac), [`23c931e`](https://github.com/clerk/javascript/commit/23c931e9e95e6de992549ad499b477aca9a9c344), [`730262f`](https://github.com/clerk/javascript/commit/730262f0f973923c8749b09078c80c2fc966a8ec), [`0b18bb1`](https://github.com/clerk/javascript/commit/0b18bb1fe6fa3ded97547bb6b4d2c73030aad329), [`021bc5f`](https://github.com/clerk/javascript/commit/021bc5f40044d34e49956ce3c9b61d833d815b42), [`1a61390`](https://github.com/clerk/javascript/commit/1a61390d3482bd4af58508b972ad89dea56fa224)]:
  - @clerk/types@4.49.0

## 3.12.0

### Minor Changes

- Support passkeys as a first factor strategy for reverification ([#5242](https://github.com/clerk/javascript/pull/5242)) by [@octoper](https://github.com/octoper)

### Patch Changes

- Update Turkish translations to replace English and Portuguese phrases ([#5257](https://github.com/clerk/javascript/pull/5257)) by [@kaandok](https://github.com/kaandok)

- Add sv-SE translations for localization keys under `signUp.legalConsent`. ([#5251](https://github.com/clerk/javascript/pull/5251)) by [@severi](https://github.com/severi)

- Updated dependencies [[`75879672c5805bfba1caca906ac0729497744164`](https://github.com/clerk/javascript/commit/75879672c5805bfba1caca906ac0729497744164), [`7ec95a7e59033600958aca4b86f3bcd5da947dec`](https://github.com/clerk/javascript/commit/7ec95a7e59033600958aca4b86f3bcd5da947dec), [`3c225d90227141dc62d955e76c7f8e0202524bc7`](https://github.com/clerk/javascript/commit/3c225d90227141dc62d955e76c7f8e0202524bc7), [`2a66c16af08573000bb619607346ac420cd4ce56`](https://github.com/clerk/javascript/commit/2a66c16af08573000bb619607346ac420cd4ce56)]:
  - @clerk/types@4.48.0

## 3.11.1

### Patch Changes

- Add `userProfile.start.passkeysSection.primaryButton` as `undefined` to all locales. ([#5281](https://github.com/clerk/javascript/pull/5281)) by [@panteliselef](https://github.com/panteliselef)

## 3.11.0

### Minor Changes

- feat(localizations): Introduce `es-UY` localization ([#5165](https://github.com/clerk/javascript/pull/5165)) by [@maramal](https://github.com/maramal)

- feat(localizations): Add a new localization file for Polish `pl-PL`. ([#5096](https://github.com/clerk/javascript/pull/5096)) by [@marceleq27](https://github.com/marceleq27)

### Patch Changes

- Update the translation of `userProfile.start.profileSection.primaryButton` in the `es-ES` locale. ([#5208](https://github.com/clerk/javascript/pull/5208)) by [@Martoxdlol](https://github.com/Martoxdlol)

- Update translations for nl-NL ([#5272](https://github.com/clerk/javascript/pull/5272)) by [@MaartenKoller](https://github.com/MaartenKoller)
  - `waitlist.start.actionLink`
  - `waitlist.start.actionText`

## 3.10.8

### Patch Changes

- Updated dependencies [[`28179323d9891bd13625e32c5682a3276e73cdae`](https://github.com/clerk/javascript/commit/28179323d9891bd13625e32c5682a3276e73cdae), [`c5c246ce91c01db9f1eaccbd354f646bcd24ec0a`](https://github.com/clerk/javascript/commit/c5c246ce91c01db9f1eaccbd354f646bcd24ec0a), [`bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a`](https://github.com/clerk/javascript/commit/bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a)]:
  - @clerk/types@4.47.0

## 3.10.7

### Patch Changes

- Populate missing `fi-FI` translations for legalConsent. ([#5103](https://github.com/clerk/javascript/pull/5103)) by [@severi](https://github.com/severi)

- Updated dependencies [[`a9b0087fca3f427f65907b358d9b5bc0c95921d8`](https://github.com/clerk/javascript/commit/a9b0087fca3f427f65907b358d9b5bc0c95921d8)]:
  - @clerk/types@4.46.1

## 3.10.6

### Patch Changes

- Add hr-HR translations for localization keys under `signUp.legalConsent`. ([#5131](https://github.com/clerk/javascript/pull/5131)) by [@harunsmrkovic](https://github.com/harunsmrkovic)

- Updated dependencies [[`dd2cbfe9f30358b6b298901bb52fa378b0acdca3`](https://github.com/clerk/javascript/commit/dd2cbfe9f30358b6b298901bb52fa378b0acdca3), [`570d8386f6aa596bf7bb1659bdddb8dd4d992b1d`](https://github.com/clerk/javascript/commit/570d8386f6aa596bf7bb1659bdddb8dd4d992b1d)]:
  - @clerk/types@4.46.0

## 3.10.5

### Patch Changes

- Update "profile" translations for en-MX.ts ([#5081](https://github.com/clerk/javascript/pull/5081)) by [@alanmoyano](https://github.com/alanmoyano)
  - `userProfile.profilePage.title`
  - `userProfile.start.profileSection.primaryButton`

- Replaces hard-coded string `"Add a passkey"` with a new localization key `userProfile.start.passkeysSection.primaryButton` ([#5105](https://github.com/clerk/javascript/pull/5105)) by [@Philitician](https://github.com/Philitician)

- Updated dependencies [[`767ac85fe6ce0ee0594c923e9af701bb05f40a0b`](https://github.com/clerk/javascript/commit/767ac85fe6ce0ee0594c923e9af701bb05f40a0b), [`225b38c7187d31fc755155ea99834ca03894d36b`](https://github.com/clerk/javascript/commit/225b38c7187d31fc755155ea99834ca03894d36b), [`429f1bfe5f7a554ab1fdf265475ba6c8b3f78472`](https://github.com/clerk/javascript/commit/429f1bfe5f7a554ab1fdf265475ba6c8b3f78472)]:
  - @clerk/types@4.45.1

## 3.10.4

### Patch Changes

- Updated dependencies [[`d3152be7f01fbb5ca26aeddc2437021f4b7ecc83`](https://github.com/clerk/javascript/commit/d3152be7f01fbb5ca26aeddc2437021f4b7ecc83), [`f976349243da2b75023e59e802460e6f3592ebbd`](https://github.com/clerk/javascript/commit/f976349243da2b75023e59e802460e6f3592ebbd)]:
  - @clerk/types@4.45.0

## 3.10.3

### Patch Changes

- Updated dependencies [[`833693a6792b621e72162d70673e7bdfa84a69b6`](https://github.com/clerk/javascript/commit/833693a6792b621e72162d70673e7bdfa84a69b6)]:
  - @clerk/types@4.44.3

## 3.10.2

### Patch Changes

- Updated dependencies [[`1345cb487970a7347351897e80dfb829d85c41ea`](https://github.com/clerk/javascript/commit/1345cb487970a7347351897e80dfb829d85c41ea)]:
  - @clerk/types@4.44.2

## 3.10.1

### Patch Changes

- Add `subtitleCombined` localizations to sign-in-or-up flow. ([#4988](https://github.com/clerk/javascript/pull/4988)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Introduced searching for members list on `OrganizationProfile` ([#4942](https://github.com/clerk/javascript/pull/4942)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`57c983fdc2b8d883623a2294daae0ac6c02c48f6`](https://github.com/clerk/javascript/commit/57c983fdc2b8d883623a2294daae0ac6c02c48f6), [`a26cf0ff10c76244975c454fdf6c615475d4bcd5`](https://github.com/clerk/javascript/commit/a26cf0ff10c76244975c454fdf6c615475d4bcd5)]:
  - @clerk/types@4.44.1

## 3.10.0

### Minor Changes

- Unified `formHint` under `userProfile.emailAddressPage` for all first factor auth methods ([#4406](https://github.com/clerk/javascript/pull/4406)) by [@NicolasLopes7](https://github.com/NicolasLopes7)

### Patch Changes

- Add sign up title localization for use in sign-in-or-up flow. ([#4983](https://github.com/clerk/javascript/pull/4983)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`2179690c10a61b117e82fdd566b34939f4d28bc1`](https://github.com/clerk/javascript/commit/2179690c10a61b117e82fdd566b34939f4d28bc1), [`bdb537a9902c0f0ae58ca1d4b7590d929f28fedb`](https://github.com/clerk/javascript/commit/bdb537a9902c0f0ae58ca1d4b7590d929f28fedb)]:
  - @clerk/types@4.44.0

## 3.9.14

### Patch Changes

- Additional changes to waitlist component translations `nl-NL` ([#4975](https://github.com/clerk/javascript/pull/4975)) by [@FiremanPete](https://github.com/FiremanPete)

- Update `nl-NL` localization strings ([#4970](https://github.com/clerk/javascript/pull/4970)) by [@FiremanPete](https://github.com/FiremanPete)

- Updated dependencies [[`6e096564a459db4eaf953e99e570905b10be6c84`](https://github.com/clerk/javascript/commit/6e096564a459db4eaf953e99e570905b10be6c84)]:
  - @clerk/types@4.43.0

## 3.9.13

### Patch Changes

- Updated dependencies [[`fe3e49f61acefe8d7f1992405f7cb415fea2e5c8`](https://github.com/clerk/javascript/commit/fe3e49f61acefe8d7f1992405f7cb415fea2e5c8), [`4427c4702f64d4f28f7564ce5889d41e260aa519`](https://github.com/clerk/javascript/commit/4427c4702f64d4f28f7564ce5889d41e260aa519)]:
  - @clerk/types@4.42.0

## 3.9.12

### Patch Changes

- Remove experimental prefix from combined title. ([#4935](https://github.com/clerk/javascript/pull/4935)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`418ec5c62c4eb600566faab07684c068a29007e3`](https://github.com/clerk/javascript/commit/418ec5c62c4eb600566faab07684c068a29007e3)]:
  - @clerk/types@4.41.2

## 3.9.11

### Patch Changes

- - Add missing translations for backup codes ([#4866](https://github.com/clerk/javascript/pull/4866)) by [@ttwrpz](https://github.com/ttwrpz)

  - Complete Thai translations for form field placeholders
  - Add translations for sign in/up waitlist messages
  - Add Thai translations for verification flows
  - Add Thai error message translations
  - Complete organization-related translations

## 3.9.10

### Patch Changes

- Updated dependencies [[`7ffc99b48977b9f6c74c0c71c500b60cb8aba65e`](https://github.com/clerk/javascript/commit/7ffc99b48977b9f6c74c0c71c500b60cb8aba65e)]:
  - @clerk/types@4.41.1

## 3.9.9

### Patch Changes

- Updated dependencies [[`4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d`](https://github.com/clerk/javascript/commit/4af35380f18d1d06c15ad1f5745c2d5a1ab1c37d), [`aa48b1f9e890b2402e9d05989a4820141076f7bf`](https://github.com/clerk/javascript/commit/aa48b1f9e890b2402e9d05989a4820141076f7bf), [`53bd34fff38b17498edf66cc4bc2d42d707f28dc`](https://github.com/clerk/javascript/commit/53bd34fff38b17498edf66cc4bc2d42d707f28dc)]:
  - @clerk/types@4.41.0

## 3.9.8

### Patch Changes

- Update `socialButtonsBlockButtonManyInView` to only accept `'${string}{{provider|titleize}}${string}'` or `undefined`. ([#4887](https://github.com/clerk/javascript/pull/4887)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6`](https://github.com/clerk/javascript/commit/fd7a5be73db3acaa7daeb9b15af73c2ce99d03a6)]:
  - @clerk/types@4.40.3

## 3.9.7

### Patch Changes

- Improve `el-GR` localization strings for profile modal. ([#4828](https://github.com/clerk/javascript/pull/4828)) by [@tbjers](https://github.com/tbjers)

- Updated dependencies [[`44cab6038af0a4d23869b3b292ece742fbbc4d85`](https://github.com/clerk/javascript/commit/44cab6038af0a4d23869b3b292ece742fbbc4d85)]:
  - @clerk/types@4.40.2

## 3.9.6

### Patch Changes

- Improve error handling when trying to sign-in/sign-up with web3 wallet and wallet is not installed in the browser ([#4845](https://github.com/clerk/javascript/pull/4845)) by [@nikospapcom](https://github.com/nikospapcom)

- Updated dependencies [[`80e1117631d35834705119a79cdcf9e0ed423fdd`](https://github.com/clerk/javascript/commit/80e1117631d35834705119a79cdcf9e0ed423fdd)]:
  - @clerk/types@4.40.1

## 3.9.5

### Patch Changes

- Fix delete account action for `nb-NO` localization. ([#4821](https://github.com/clerk/javascript/pull/4821)) by [@lasseklovstad](https://github.com/lasseklovstad)

## 3.9.4

### Patch Changes

- Updated dependencies [[`c9da04636ffe1ba804a1ce5e5b79027d3a2344d2`](https://github.com/clerk/javascript/commit/c9da04636ffe1ba804a1ce5e5b79027d3a2344d2)]:
  - @clerk/types@4.40.0

## 3.9.3

### Patch Changes

- Improve `el-GR` localization. ([#4757](https://github.com/clerk/javascript/pull/4757)) by [@dikaioai](https://github.com/dikaioai)

- Improve `pl-PL` localization. ([#4781](https://github.com/clerk/javascript/pull/4781)) by [@mic0ishere](https://github.com/mic0ishere)

## 3.9.2

### Patch Changes

- Added min and max length username settings to username field error. ([#4771](https://github.com/clerk/javascript/pull/4771)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`aeafa7c5efd50c893d088ac99199d7eaecc04025`](https://github.com/clerk/javascript/commit/aeafa7c5efd50c893d088ac99199d7eaecc04025), [`acd9326ef2d6942b981b3ee59c4b20ddd303323d`](https://github.com/clerk/javascript/commit/acd9326ef2d6942b981b3ee59c4b20ddd303323d)]:
  - @clerk/types@4.39.4

## 3.9.1

### Patch Changes

- Updated dependencies [[`e1748582d0c89462f48a482a7805871b7065fa19`](https://github.com/clerk/javascript/commit/e1748582d0c89462f48a482a7805871b7065fa19), [`7f7edcaa8228c26d19e9081979100ada7e982095`](https://github.com/clerk/javascript/commit/7f7edcaa8228c26d19e9081979100ada7e982095), [`dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d`](https://github.com/clerk/javascript/commit/dd3fdc7b2a96ddb90b33c6f1cefb055a60f99a9d)]:
  - @clerk/types@4.39.3

## 3.9.0

### Minor Changes

- Switching to use ^ for semver ranges of internal @clerk/ production dependencies. ([#4664](https://github.com/clerk/javascript/pull/4664)) by [@jacekradko](https://github.com/jacekradko)

## 3.8.2

### Patch Changes

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/types@4.39.2

## 3.8.1

### Patch Changes

- Fix translations and typos in `es-ES` and `es-MX` localizations. ([#4731](https://github.com/clerk/javascript/pull/4731)) by [@paratustra](https://github.com/paratustra)

- Fix accents on it-IT localization values. ([#4733](https://github.com/clerk/javascript/pull/4733)) by [@Onnwen](https://github.com/Onnwen)

- Updated dependencies [[`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/types@4.39.1

## 3.8.0

### Minor Changes

- Added support for en-GB localization ([#4313](https://github.com/clerk/javascript/pull/4313)) by [@ijxy](https://github.com/ijxy)

- Updated translations for multiple languages: be-BY, bg-BG, ca-ES, cs-CZ, da-DK, de-DE, en-US, es-ES, fr-FR, it-IT, nl-NL, pt-BR, pt-PT, tr-TR ([#4700](https://github.com/clerk/javascript/pull/4700)) by [@NavidJalilian](https://github.com/NavidJalilian)

### Patch Changes

- Introduce experimental sign-in combined flow. ([#4607](https://github.com/clerk/javascript/pull/4607)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Add `pt-BR` localizations for disconnected accounts, waitlist, mfa, consent ([#4673](https://github.com/clerk/javascript/pull/4673)) by [@GustavoOS](https://github.com/GustavoOS)

- Adds `id-ID` localization ([#4686](https://github.com/clerk/javascript/pull/4686)) by [@ShawnCone](https://github.com/ShawnCone)

- Fix localizations and typos in ru-RU.ts ([#4695](https://github.com/clerk/javascript/pull/4695)) by [@pipisasa](https://github.com/pipisasa)

- Updated dependencies [[`550c7e9851329688e37be29b83ea0c3b12482af7`](https://github.com/clerk/javascript/commit/550c7e9851329688e37be29b83ea0c3b12482af7), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99)]:
  - @clerk/types@4.39.0

## 3.7.4

### Patch Changes

- Updated dependencies [[`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3)]:
  - @clerk/types@4.38.0

## 3.7.3

### Patch Changes

- Updated dependencies [[`4e5e7f463c12893a21cb3b5f9317fc3f2945879b`](https://github.com/clerk/javascript/commit/4e5e7f463c12893a21cb3b5f9317fc3f2945879b)]:
  - @clerk/types@4.37.0

## 3.7.2

### Patch Changes

- Translates a FAPI error message for when an organization domain is already in use for an organization's SSO ([#4671](https://github.com/clerk/javascript/pull/4671)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Updated dependencies [[`8ee5d84995fa17532491ff96efac5738c9bcd9ef`](https://github.com/clerk/javascript/commit/8ee5d84995fa17532491ff96efac5738c9bcd9ef), [`09fedd1df155d30cc055ce701b133aa6470e9b47`](https://github.com/clerk/javascript/commit/09fedd1df155d30cc055ce701b133aa6470e9b47)]:
  - @clerk/types@4.36.0

## 3.7.1

### Patch Changes

- Updated dependencies [[`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d)]:
  - @clerk/types@4.35.1

## 3.7.0

### Minor Changes

- Moves all properties under `__experimental_userVerification` to `reverification`. This affects all languages. ([#4536](https://github.com/clerk/javascript/pull/4536)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Rename userVerification to reverification to align with the feature name. ([#4634](https://github.com/clerk/javascript/pull/4634)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`dce4f7ffca7248c0500f0ec9a978672b1f2fad69`](https://github.com/clerk/javascript/commit/dce4f7ffca7248c0500f0ec9a978672b1f2fad69)]:
  - @clerk/types@4.35.0

## 3.6.6

### Patch Changes

- Updated dependencies [[`c70994b5b6f92a6550dfe37547f01bbfa810c223`](https://github.com/clerk/javascript/commit/c70994b5b6f92a6550dfe37547f01bbfa810c223), [`7623a99594e7329200b6b374e483152d7679ce66`](https://github.com/clerk/javascript/commit/7623a99594e7329200b6b374e483152d7679ce66)]:
  - @clerk/types@4.34.2

## 3.6.5

### Patch Changes

- Improve `el-GR` localization. ([#4593](https://github.com/clerk/javascript/pull/4593)) by [@dikaioai](https://github.com/dikaioai)

- Updated dependencies [[`e47eb5882a7fd4a8dee25933c6644790d6ea3407`](https://github.com/clerk/javascript/commit/e47eb5882a7fd4a8dee25933c6644790d6ea3407), [`273d16cb0665d4d960838cb294dc356f41814745`](https://github.com/clerk/javascript/commit/273d16cb0665d4d960838cb294dc356f41814745)]:
  - @clerk/types@4.34.1

## 3.6.4

### Patch Changes

- Updated dependencies [[`46faeb6f59b19c963fb137c858347525b1cd9e19`](https://github.com/clerk/javascript/commit/46faeb6f59b19c963fb137c858347525b1cd9e19)]:
  - @clerk/types@4.34.0

## 3.6.3

### Patch Changes

- Updated dependencies [[`1c0b5001f7f975a2f3f54ad692526ecf7257847e`](https://github.com/clerk/javascript/commit/1c0b5001f7f975a2f3f54ad692526ecf7257847e), [`6217a3f7c94311d49f873214bd406961e0b8d6f7`](https://github.com/clerk/javascript/commit/6217a3f7c94311d49f873214bd406961e0b8d6f7), [`1783025cdb94c447028704c2121fa0b8af785904`](https://github.com/clerk/javascript/commit/1783025cdb94c447028704c2121fa0b8af785904)]:
  - @clerk/types@4.33.0

## 3.6.2

### Patch Changes

- Add legal consent translations to the `el-GR` localization. ([#4543](https://github.com/clerk/javascript/pull/4543)) by [@dikaioai](https://github.com/dikaioai)

## 3.6.1

### Patch Changes

- Updated dependencies [[`7dbad4c5abd226d7b10941a626ead5d85b1a3f24`](https://github.com/clerk/javascript/commit/7dbad4c5abd226d7b10941a626ead5d85b1a3f24)]:
  - @clerk/types@4.32.0

## 3.6.0

### Minor Changes

- The Legal consent feature is now stable. ([#4487](https://github.com/clerk/javascript/pull/4487)) by [@octoper](https://github.com/octoper)

  Removed the `__experimental_` prefix.

### Patch Changes

- Adds German (de-DE) translations for experimental legal content ([#4503](https://github.com/clerk/javascript/pull/4503)) by [@feliche93](https://github.com/feliche93)

- Updated dependencies [[`f7472e22877f62fc7f3c8d3efe409ff2276fb4a3`](https://github.com/clerk/javascript/commit/f7472e22877f62fc7f3c8d3efe409ff2276fb4a3), [`e199037b8f484abdeeb9fc24455a1b4b8c31c8dd`](https://github.com/clerk/javascript/commit/e199037b8f484abdeeb9fc24455a1b4b8c31c8dd), [`0e443ad7c76643420b50e5b169193e03f6ef79f9`](https://github.com/clerk/javascript/commit/0e443ad7c76643420b50e5b169193e03f6ef79f9), [`cc24c8145f1eea7fb91550f2c3e0bac3993e4320`](https://github.com/clerk/javascript/commit/cc24c8145f1eea7fb91550f2c3e0bac3993e4320)]:
  - @clerk/types@4.31.0

## 3.5.0

### Minor Changes

- New Feature: Introduce the `<Waitlist />` component and the `waitlist` sign up mode. ([#4376](https://github.com/clerk/javascript/pull/4376)) by [@nikospapcom](https://github.com/nikospapcom)
  - Allow users to request access with an email address via the new `<Waitlist />` component.
  - Show `Join waitlist` prompt from `<SignIn />` component when mode is `waitlist`.
  - Appropriate the text in the Sign Up component when mode is `waitlist`.
  - Added `joinWaitlist()` method in `Clerk` singleton.
  - Added `redirectToWaitlist()` method in `Clerk` singleton to allow user to redirect to waitlist page.

### Patch Changes

- Updated dependencies [[`d74a6a7c0f291104c6bba722a8c432814d7b336e`](https://github.com/clerk/javascript/commit/d74a6a7c0f291104c6bba722a8c432814d7b336e), [`1a0c8fe665869e732d3c800bde0f5219fce54301`](https://github.com/clerk/javascript/commit/1a0c8fe665869e732d3c800bde0f5219fce54301)]:
  - @clerk/types@4.30.0

## 3.4.4

### Patch Changes

- Updates missing Russian translations by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 3.4.1

### Patch Changes

- pl-PL localization updates ([#4370](https://github.com/clerk/javascript/pull/4370)) by [@mic0ishere](https://github.com/mic0ishere)

- Fix formatting of `sv-SE` ([#4419](https://github.com/clerk/javascript/pull/4419)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Fix `frFR` confirmDeletionUserAccount text to ensure button text is enabled properly when the values match. ([#4420](https://github.com/clerk/javascript/pull/4420)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Update the 'sv-SE' localization. ([#4292](https://github.com/clerk/javascript/pull/4292)) by [@MarcusT96](https://github.com/MarcusT96)

- Updated dependencies [[`f875463da`](https://github.com/clerk/javascript/commit/f875463da9692f2d173b6d5388743cf720750ae3), [`5be7ca9fd`](https://github.com/clerk/javascript/commit/5be7ca9fd239c937cc88e20ce8f5bfc9f3b84f22), [`434b432f8`](https://github.com/clerk/javascript/commit/434b432f8c114825120eef0f2c278b8142ed1563)]:
  - @clerk/types@4.29.0

## 3.4.0

### Minor Changes

- Adding experimental support for legal consent for `<SignUp/>` component ([#4337](https://github.com/clerk/javascript/pull/4337)) by [@octoper](https://github.com/octoper)

### Patch Changes

- Updated dependencies [[`3fdcdbf88`](https://github.com/clerk/javascript/commit/3fdcdbf88c38facf8b82563f634ec1b6604fd8e5)]:
  - @clerk/types@4.28.0

## 3.3.1

### Patch Changes

- Updated dependencies [[`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc), [`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc)]:
  - @clerk/types@4.27.0

## 3.3.0

### Minor Changes

- The "Restricted access" screen has been improved for visual consistency and the ability to contact support. The displayed texts have been made more clear and the sign-in button has been moved to the bottom. ([#4335](https://github.com/clerk/javascript/pull/4335)) by [@nikospapcom](https://github.com/nikospapcom)

### Patch Changes

- Remove typos from pl-PL ([#4319](https://github.com/clerk/javascript/pull/4319)) by [@pmichalski98](https://github.com/pmichalski98)

- Updated dependencies [[`e81d45b72`](https://github.com/clerk/javascript/commit/e81d45b72c81403c7c206dac5454de1fef6bec57), [`99cdf9b67`](https://github.com/clerk/javascript/commit/99cdf9b67d1e99e66cc73d8a5bfce1f1f8df1b83), [`ce40ff6f0`](https://github.com/clerk/javascript/commit/ce40ff6f0d3bc79e33375be6dd5e03f140a07000), [`2102052c0`](https://github.com/clerk/javascript/commit/2102052c017065ab511339870fcebaa6719f2702)]:
  - @clerk/types@4.26.0

## 3.2.1

### Patch Changes

- Updated dependencies [[`2ba2fd148`](https://github.com/clerk/javascript/commit/2ba2fd1483b7561d7df9a1952ead0ee15e422131)]:
  - @clerk/types@4.25.1

## 3.2.0

### Minor Changes

- Add be-BY translation ([#4280](https://github.com/clerk/javascript/pull/4280)) by [@NikitaRadzkov](https://github.com/NikitaRadzkov)

### Patch Changes

- Update `de-DE` translation to be GDPR-compliant ([#4195](https://github.com/clerk/javascript/pull/4195)) by [@serbanradulescu](https://github.com/serbanradulescu)

## 3.1.2

### Patch Changes

- Updated dependencies [[`fb932e5cf`](https://github.com/clerk/javascript/commit/fb932e5cf21315adf60bee0855b6bd5ee2ff9867)]:
  - @clerk/types@4.25.0

## 3.1.1

### Patch Changes

- Updated dependencies [[`f6fb8b53d`](https://github.com/clerk/javascript/commit/f6fb8b53d236863ad7eca576ee7a16cd33f3506b), [`4a8570590`](https://github.com/clerk/javascript/commit/4a857059059a02bb4f20893e08601e1e67babbed)]:
  - @clerk/types@4.24.0

## 3.1.0

### Minor Changes

- Render "Restricted access" screen in `<SignUp />` component when `signup.mode` in `userSettings` is `restricted` ([#4220](https://github.com/clerk/javascript/pull/4220)) by [@nikospapcom](https://github.com/nikospapcom)

### Patch Changes

- Updated dependencies [[`4749ed4c5`](https://github.com/clerk/javascript/commit/4749ed4c55a5ba5810451b8d436aad0d49829050), [`f1f17eaab`](https://github.com/clerk/javascript/commit/f1f17eaabed0dc4b7de405fb77d85503cf75ad33), [`2e35ac538`](https://github.com/clerk/javascript/commit/2e35ac53885f8008779940d41d1e804fa77ebfa9)]:
  - @clerk/types@4.23.0

## 3.0.6

### Patch Changes

- Updated dependencies [[`c9063853e`](https://github.com/clerk/javascript/commit/c9063853e538a4010f5d4e522a3da5abc80098a4), [`19d3808d4`](https://github.com/clerk/javascript/commit/19d3808d4672234944226d6709ec51214e8d6e1d), [`737bcbb0f`](https://github.com/clerk/javascript/commit/737bcbb0ffb5e2dcadbb02e8fc718fe8825c5842)]:
  - @clerk/types@4.22.0

## 3.0.5

### Patch Changes

- Updated dependencies [[`2e5c550e4`](https://github.com/clerk/javascript/commit/2e5c550e4aec61150c2a17fdcd4a0e1273cb50e7)]:
  - @clerk/types@4.21.1

## 3.0.4

### Patch Changes

- nl-NL localization updates ([#4181](https://github.com/clerk/javascript/pull/4181)) by [@guustgoossens](https://github.com/guustgoossens)

## 3.0.3

### Patch Changes

- Update he-IL ([#4169](https://github.com/clerk/javascript/pull/4169)) by [@develad](https://github.com/develad)

- Added Croatian localization (hr-HR) ([#4168](https://github.com/clerk/javascript/pull/4168)) by [@psiho](https://github.com/psiho)

## 3.0.2

### Patch Changes

- Add empty translation keys for organization name validation errors ([#4152](https://github.com/clerk/javascript/pull/4152)) by [@wobsoriano](https://github.com/wobsoriano)

- Replace empty strings with undefined to ensure localizations fallback to `en-US` properly. ([#4151](https://github.com/clerk/javascript/pull/4151)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Adds translation keys for error messages from the [organizations API](https://clerk.com/docs/references/api/organizations#errors). ([#4123](https://github.com/clerk/javascript/pull/4123)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Adding missing localisation for es-ES on update profile button ([#4148](https://github.com/clerk/javascript/pull/4148)) by [@kduprey](https://github.com/kduprey)

- Updated dependencies [[`248142a6d`](https://github.com/clerk/javascript/commit/248142a6ded6ca937d0df7d628197f25228aadec), [`1189f71f8`](https://github.com/clerk/javascript/commit/1189f71f872f2683c12de5add5f154aeb953ca8d)]:
  - @clerk/types@4.21.0

## 3.0.1

### Patch Changes

- Updated dependencies [[`8c6909d46`](https://github.com/clerk/javascript/commit/8c6909d46328c943f1d464a28f1a324a27d0f3f1)]:
  - @clerk/types@4.20.1

## 3.0.0

### Major Changes

- Update Simplified Chinese based on en US version ([#4107](https://github.com/clerk/javascript/pull/4107)) by [@youyou-sudo](https://github.com/youyou-sudo)

### Patch Changes

- Updated dependencies [[`c63a5adf0`](https://github.com/clerk/javascript/commit/c63a5adf0ba4b99252146f168318f51b709bb5dd), [`8823c21a2`](https://github.com/clerk/javascript/commit/8823c21a26bc81cbc3ed007908b1a9ea474bd343), [`a0cb062fa`](https://github.com/clerk/javascript/commit/a0cb062faa4d23bef7a577e5cc486f4c5efe6bfa)]:
  - @clerk/types@4.20.0

## 2.8.1

### Patch Changes

- Updated dependencies [[`8a3b9f079`](https://github.com/clerk/javascript/commit/8a3b9f0793484b32dd609a5c80a194e62151d6ea), [`e95c28196`](https://github.com/clerk/javascript/commit/e95c2819675cea7963f2404e5f71f37ebed8d5e0)]:
  - @clerk/types@4.19.0

## 2.8.0

### Minor Changes

- Add localization keys for `<__experimental_UserVerification />` (experimental feature). ([#4016](https://github.com/clerk/javascript/pull/4016)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`82593173a`](https://github.com/clerk/javascript/commit/82593173aafbf6646e12c5779627cdcb138a1f27), [`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733)]:
  - @clerk/types@4.18.0

## 2.7.1

### Patch Changes

- Tidy up and improve README ([#4053](https://github.com/clerk/javascript/pull/4053)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`58e6754ad`](https://github.com/clerk/javascript/commit/58e6754ad9f9a1244b023ce1f5e5f2c1c4eb20e7), [`13693018f`](https://github.com/clerk/javascript/commit/13693018f4f7ac5d224698aa730e20960896f68c), [`3304dcc0b`](https://github.com/clerk/javascript/commit/3304dcc0bc93a92a7f729f585c60ff91d2ae04f6)]:
  - @clerk/types@4.17.0

## 2.7.0

### Minor Changes

- Support connecting Coinbase Wallet via <UserProfile /> ([#4030](https://github.com/clerk/javascript/pull/4030)) by [@chanioxaris](https://github.com/chanioxaris)

### Patch Changes

- Improve `he-IL` localization values. ([#4025](https://github.com/clerk/javascript/pull/4025)) by [@TgMrP](https://github.com/TgMrP)

- Updated dependencies [[`c1389492d`](https://github.com/clerk/javascript/commit/c1389492d8b6a9292ab04889bf776c0f45e66845)]:
  - @clerk/types@4.16.0

## 2.6.3

### Patch Changes

- Updated dependencies [[`0158c774a`](https://github.com/clerk/javascript/commit/0158c774af2243a2cd13b55c4d6fae877178c961), [`8be1a7abc`](https://github.com/clerk/javascript/commit/8be1a7abc8849d7d59552011bd6b25bc917d51f5)]:
  - @clerk/types@4.15.1

## 2.6.2

### Patch Changes

- Updated dependencies [[`247b3fd75`](https://github.com/clerk/javascript/commit/247b3fd75042365dc9f950db056b76f9fadfdcf6)]:
  - @clerk/types@4.15.0

## 2.6.1

### Patch Changes

- Fix spelling in the Icelandic (is-IS) localization file. ([#3994](https://github.com/clerk/javascript/pull/3994)) by [@bjaben](https://github.com/bjaben)

- Improve `fr-FR` localization values. ([#3993](https://github.com/clerk/javascript/pull/3993)) by [@coooola](https://github.com/coooola)

- Update `tr-TR` localization values. ([#3997](https://github.com/clerk/javascript/pull/3997)) by [@ardaeker](https://github.com/ardaeker)

## 2.6.0

### Minor Changes

- Introduce the Icelandic (is-IS) localization. ([#3953](https://github.com/clerk/javascript/pull/3953)) by [@bjaben](https://github.com/bjaben)

### Patch Changes

- Update `th-TH` localization values. ([#3979](https://github.com/clerk/javascript/pull/3979)) by [@ttwrpz](https://github.com/ttwrpz)

- Update Czech translations ([#3978](https://github.com/clerk/javascript/pull/3978)) by [@JakubSvestka](https://github.com/JakubSvestka)

- Remove unused `da-DK` localization values. ([#3983](https://github.com/clerk/javascript/pull/3983)) by [@wobsoriano](https://github.com/wobsoriano)

- Update `da-DK` localization values. ([#3975](https://github.com/clerk/javascript/pull/3975)) by [@renenielsendk](https://github.com/renenielsendk)

- Updated dependencies [[`dc0e1c33d`](https://github.com/clerk/javascript/commit/dc0e1c33d6844b028cb1ee11c3359b886d609f3c)]:
  - @clerk/types@4.14.0

## 2.5.8

### Patch Changes

- Updated dependencies [[`b6f0613dc`](https://github.com/clerk/javascript/commit/b6f0613dc9d8b0bab41cfabbaa8621b126e3bdf5)]:
  - @clerk/types@4.13.1

## 2.5.7

### Patch Changes

- Updated dependencies [[`4e6c94e3f`](https://github.com/clerk/javascript/commit/4e6c94e3f4cc92cbba8bddcd2b90fcc9cfb83763)]:
  - @clerk/types@4.13.0

## 2.5.6

### Patch Changes

- Updated dependencies [[`9b2aeacb3`](https://github.com/clerk/javascript/commit/9b2aeacb32fff7c300bda458636a1cc81a42ee7b)]:
  - @clerk/types@4.12.1

## 2.5.5

### Patch Changes

- Updated dependencies [[`7e94fcf0f`](https://github.com/clerk/javascript/commit/7e94fcf0fcbee8842a54f7931c45190370aa870d)]:
  - @clerk/types@4.12.0

## 2.5.4

### Patch Changes

- Updated dependencies [[`568186cad`](https://github.com/clerk/javascript/commit/568186cad29acaf0b084a9f86ccb9d29bd23fcf4), [`407195270`](https://github.com/clerk/javascript/commit/407195270ed8aab6eef18c64a4918e3870fef471)]:
  - @clerk/types@4.11.0

## 2.5.3

### Patch Changes

- Translate ar-SA localization strings for Organization Profile ([#3797](https://github.com/clerk/javascript/pull/3797)) by [@mahsayedsalem](https://github.com/mahsayedsalem)

- Updated missing and untranslated Arabic localizations ([#3821](https://github.com/clerk/javascript/pull/3821)) by [@MhndMousa](https://github.com/MhndMousa)

- Replaced "Delete account" with spanish translation "Eliminar cuenta" ([#3832](https://github.com/clerk/javascript/pull/3832)) by [@martin-dos-santos](https://github.com/martin-dos-santos)

- Updated dependencies [[`aa06f3ba7`](https://github.com/clerk/javascript/commit/aa06f3ba7e725071c90d4a1d6840060236da3c23), [`80e647731`](https://github.com/clerk/javascript/commit/80e64773135865434cf0e6c220e287397aa07937)]:
  - @clerk/types@4.10.0

## 2.5.2

### Patch Changes

- Add `signUp.start.actionLink__use_email` and `signUp.start.actionLink__use_phone` localization keys. ([#3826](https://github.com/clerk/javascript/pull/3826)) by [@alexcarpenter](https://github.com/alexcarpenter)

- Updated dependencies [[`b48689705`](https://github.com/clerk/javascript/commit/b48689705f9fc2251d2f24addec7a0d0b1da0fe1)]:
  - @clerk/types@4.9.1

## 2.5.1

### Patch Changes

- Update german translations for passkeys ([#3695](https://github.com/clerk/javascript/pull/3695)) by [@navid-rji](https://github.com/navid-rji)

## 2.5.0

### Minor Changes

- - Introduced `subtitle__disconnected` under `userProfile.start.connectedAccountsSection` ([#3723](https://github.com/clerk/javascript/pull/3723)) by [@panteliselef](https://github.com/panteliselef)

  - Aligned `signUp.start.clientMismatch` and `signIn.start.clientMismatch` to all languages.

- Add support for Finnish (fi-FI) language for @clerk/localizations ([#3634](https://github.com/clerk/javascript/pull/3634)) by [@theisoj](https://github.com/theisoj)

### Patch Changes

- Update text on sv-SE localization ([#3635](https://github.com/clerk/javascript/pull/3635)) by [@kamigerami](https://github.com/kamigerami)

- Updated dependencies [[`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`86c75e50c`](https://github.com/clerk/javascript/commit/86c75e50cba9c4efb480672f1b8c6a6fff4ef477)]:
  - @clerk/types@4.9.0

## 2.4.8

### Patch Changes

- Updated dependencies [[`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7)]:
  - @clerk/types@4.8.0

## 2.4.7

### Patch Changes

- Updated dependencies [[`d6b5006c4`](https://github.com/clerk/javascript/commit/d6b5006c4cc1b6f07bb3a6832b4ec6e65ea15814)]:
  - @clerk/types@4.7.0

## 2.4.6

### Patch Changes

- Add Italian localizations ([#3608](https://github.com/clerk/javascript/pull/3608)) by [@mazzasaverio](https://github.com/mazzasaverio)

## 2.4.5

### Patch Changes

- Updated dependencies [[`1273b04ec`](https://github.com/clerk/javascript/commit/1273b04ecf1866b59ef59a74abe31dbcc726da2c)]:
  - @clerk/types@4.6.1

## 2.4.4

### Patch Changes

- Update profile primary button text and nav text in fr-FR & zh-CN ([#3494](https://github.com/clerk/javascript/pull/3494)) by [@youshengCode](https://github.com/youshengCode)

- Set `@clerk/types` as a dependency for packages that had it as a dev dependency. ([#3450](https://github.com/clerk/javascript/pull/3450)) by [@desiprisg](https://github.com/desiprisg)

- Updates on ko-KR localization ([#3454](https://github.com/clerk/javascript/pull/3454)) by [@jourmooney](https://github.com/jourmooney)

- Add passkeys localizations for the `es-MX` locale ([#3453](https://github.com/clerk/javascript/pull/3453)) by [@HugoCL](https://github.com/HugoCL)

- Updated dependencies [[`73e5d61e2`](https://github.com/clerk/javascript/commit/73e5d61e21ab3f77f3c8343bc63da0626466c7ac), [`b8e46328d`](https://github.com/clerk/javascript/commit/b8e46328da874859c4928f19f924219cd6520b11)]:
  - @clerk/types@4.6.0

## 2.4.3

### Patch Changes

- Review PT-BR localization: Adds missing keys, fixes some typos ([#3412](https://github.com/clerk/javascript/pull/3412)) by [@danilofuchs](https://github.com/danilofuchs)

## 2.4.2

### Patch Changes

- Added missing translations for the Spanish (Spain) locale (es_ES). ([#3389](https://github.com/clerk/javascript/pull/3389)) by [@frankdavidcorona](https://github.com/frankdavidcorona)

## 2.4.1

### Patch Changes

- Add missing es-ES localization keys ([#3382](https://github.com/clerk/javascript/pull/3382)) by [@frankdavidcorona](https://github.com/frankdavidcorona)

## 2.4.0

### Minor Changes

- Add srRS localization ([#3338](https://github.com/clerk/javascript/pull/3338)) by [@paunovic5ar](https://github.com/paunovic5ar)

- Added new keys for email link verification under `signIn.emailLink.clientMismatch` and `signUp.emailLink.clientMismatch` ([#3367](https://github.com/clerk/javascript/pull/3367)) by [@mzhong9723](https://github.com/mzhong9723)

### Patch Changes

- Update esMX language module ([#3372](https://github.com/clerk/javascript/pull/3372)) by [@Thiagoamaro2431](https://github.com/Thiagoamaro2431)

## 2.3.1

### Patch Changes

- feat(localizations): Update PL translations ([#3342](https://github.com/clerk/javascript/pull/3342)) by [@dawid-grabowski](https://github.com/dawid-grabowski)

- Add some phrases to it-IT localization ([#3314](https://github.com/clerk/javascript/pull/3314)) by [@ugoborghetti](https://github.com/ugoborghetti)

## 2.3.0

### Minor Changes

- Allow localization of text in social buttons when many are listed. ([#3282](https://github.com/clerk/javascript/pull/3282)) by [@panteliselef](https://github.com/panteliselef)

## 2.2.0

### Minor Changes

- Drop `react` and `react-dom` as peer dependencies since they are not necessary for this package. ([#3273](https://github.com/clerk/javascript/pull/3273)) by [@panteliselef](https://github.com/panteliselef)

## 2.1.0

### Minor Changes

- Replace "email ID" with "email address" in `en-US.ts` for `signIn.forgotPassword.subtitle_email` ([#3242](https://github.com/clerk/javascript/pull/3242)) by [@panteliselef](https://github.com/panteliselef)

- Remove experimental Passkeys APIs. This includes any API that is marked as experimental or has the `__experimental_` prefix. ([#3233](https://github.com/clerk/javascript/pull/3233)) by [@panteliselef](https://github.com/panteliselef)

  This prepares the Passkeys release to move further along towards a beta release and eventual stable release.

## 2.0.0

### Major Changes

- c2a090513: Change the minimal Node.js version required by Clerk to `18.17.0`.
- 52ff8fe6b: Upgrade React version to >=18 and add react-dom as peer dependency
  to fix issues with vite & rollup building.
- 7886ba89d: Refresh the look and feel of the Clerk UI components

  For more info, refer to the [upgrade guide from v4 to v5 in Clerk docs](https://clerk.com/docs/upgrade-guides/upgrading-from-v4-to-v5).

- 477170962: Drop deprecations. Migration steps:
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

### Minor Changes

- 0d0b1d89a: List passkeys under security in UserProfile.
  - Supports renaming a passkey.
  - Supports deleting a passkey.
- af80d7074: Add Thai (th-TH) localization
- afec17953: Improved error handling for registration and retrieval of passkeys.
  ClerkRuntimeError codes introduced:
  - `passkey_not_supported`
  - `passkeys_pa_not_supported`
  - `passkey_invalid_rpID_or_domain`
  - `passkey_already_exists`
  - `passkey_operation_aborted`
  - `passkey_retrieval_cancelled`
  - `passkey_retrieval_failed`
  - `passkey_registration_cancelled`
  - `passkey_registration_failed`

  Example usage:

  ```ts
  try {
    await __experimental_authenticateWithPasskey(...args);
  }catch (e) {
    if (isClerkRuntimeError(e)) {
        if (err.code === 'passkey_operation_aborted') {
            ...
        }
    }
  }


  ```

- fc3ffd880: Support for prompting a user to reset their password if it is found to be compromised during sign-in.
- 31570f138: During sign in, navigate to the `reset-password` route if the user needs a new password. This happens when you enforce password usage during sign-in in your dashboard. Previously this case wasn't handled in the password form.

  The `signIn.resetPassword.requiredMessage` localization was updated to `'For security reasons, it is required to reset your password.'`.

- 2352149f6: Move passkey related apis to stable:
  - Register passkey for a user
    Usage: `await clerk.user.createPasskey()`
  - Authenticate with passkey
    Usage: `await clerk.client.signIn.authenticateWithPasskey()`
    ```ts
    try {
      await clerk.client.signIn.authenticateWithPasskey(...args);
    }catch (e) {
      if (isClerkRuntimeError(e)) {
          if (err.code === 'passkey_operation_aborted') {
              ...
          }
      }
    }
    ```
  - ClerkRuntimeError codes introduced:
    - `passkey_not_supported`
    - `passkeys_pa_not_supported`
    - `passkey_invalid_rpID_or_domain`
    - `passkey_already_exists`
    - `passkey_operation_aborted`
    - `passkey_retrieval_cancelled`
    - `passkey_retrieval_failed`
    - `passkey_registration_cancelled`
    - `passkey_registration_failed`

  - Get the user's passkeys
    `clerk.user.passkeys`
  - Update the name of a passkey
    `clerk.user.passkeys?.[0].update({name:'Company issued passkey'})`
  - Delete a passkey
    `clerk.user.passkeys?.[0].delete()`

- b8599d700: Add support for Portuguese (Portugal) language
- 6b316611f: Correct ko-KR strings naturally
- 1078e8c58: Add hu-HU localization
- ebf9be77f: Allow users to authenticate with passkeys via the `<SignIn/>`.

### Patch Changes

- 178907ff6: Update the danger section in the `es-ES` localization
- 08118edfa: Add missing ru-RU translations
- 78ed58da4: Translate EN strings to ES in es-ES.ts
- f8328deb9: Improve Japanese translations
- 88d5d2ca0: Improve ptBR localizations
- 164ca116c: Add missing localization key for invalid phone_number (unstable error) in the en-US localization
- 2de442b24: Rename beta-v5 to beta
- 9f5491357: Add missing ru-RU localization keys
- 840636a14: Adds translation keys to be able to customize error messages when an identifier already exists:
  - form_identifier_exists\_\_email_address
  - form_identifier_exists\_\_username
  - form_identifier_exists\_\_phone_number

- 13ed9ac54: Improve Norwegian translations
- 4e31fca12: Add missing translation for profile edit button in de-DE
- 75d6bf9ad: Added Mongolian (mn-MN) localizations
- 2b8fe238a: Fix Hungarian language subpath exports
- 27fb9b728: Introduce ro-RO localization
- b473ad862: Fix zh-TW localization and export zh-TW from index.ts
- 5b8d85886: Improve German translations
- eb796dd9e: Introduce es-MX localization
- 390a70732: Fix typo in ko-KR.ts
- c6a5e0f5d: Add maintenance mode banner to the SignIn and SignUp components. The text can be customized by updating the maintenanceMode localization key.
- 4edb77632: Localize placeholder of confirmation field when deleting a user account from `<UserProfile/>`.
- e6f8928f1: Fix typos from pt-BR localization
- 2d383e413: The package now allows for [subpath exports](https://nodejs.org/api/packages.html#subpath-exports). You can now import specific languages like so:

  ```diff
  # Single language
  - import { frFR } from "@clerk/localizations"
  + import { frFR } from "@clerk/localizations/fr-FR"

  # Multiple languages
  - import { enUS, esES } from "@clerk/localizations"
  + import { enUS } from "@clerk/localizations/en-US"
  + import { esES } from "@clerk/localizations/es-ES"
  ```

  This helps with tree-shaking and will reduce your total bundle size in most cases.

  You can continue to use the top-level `@clerk/localizations` import as this is a non-breaking change. You can gradually opt-in to this optimization.

- f3b6f32b3: Added Thai translation keys for pwned password, form identifier, passkey

  Change Thai translation keys for Authenticator related to match the context

- 370b17b12: Update es-ES.ts
- 1a0268509: Add Catalan (ca-ES) localizations
- 34fe88f73: Add Bulgarian (bg-BG) localization (#2565)
- fb794ce7b: Support older iOS 13.3 and 13.4 mobile devices
- 94519aa33: Renaming `passkeys_pa_not_supported` to `passkey_pa_not_supported` to align with the rest passkey error codes.

## 2.0.0-beta.24

### Minor Changes

- Add hu-HU localization ([#3190](https://github.com/clerk/javascript/pull/3190)) by [@ezkomoly](https://github.com/ezkomoly)

### Patch Changes

- Fix Hungarian language subpath exports ([#3206](https://github.com/clerk/javascript/pull/3206)) by [@anagstef](https://github.com/anagstef)

- Support older iOS 13.3 and 13.4 mobile devices ([#3188](https://github.com/clerk/javascript/pull/3188)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.0.0-beta.23

### Patch Changes

- Renaming `passkeys_pa_not_supported` to `passkey_pa_not_supported` to align with the rest passkey error codes. ([#3173](https://github.com/clerk/javascript/pull/3173)) by [@panteliselef](https://github.com/panteliselef)

## 2.0.0-beta.22

### Minor Changes

- Move passkey related apis to stable: ([#3134](https://github.com/clerk/javascript/pull/3134)) by [@panteliselef](https://github.com/panteliselef)
  - Register passkey for a user
    Usage: `await clerk.user.createPasskey()`
  - Authenticate with passkey
    Usage: `await clerk.client.signIn.authenticateWithPasskey()`
    ```ts
    try {
      await clerk.client.signIn.authenticateWithPasskey(...args);
    }catch (e) {
      if (isClerkRuntimeError(e)) {
          if (err.code === 'passkey_operation_aborted') {
              ...
          }
      }
    }
    ```
  - ClerkRuntimeError codes introduced:
    - `passkey_not_supported`
    - `passkeys_pa_not_supported`
    - `passkey_invalid_rpID_or_domain`
    - `passkey_already_exists`
    - `passkey_operation_aborted`
    - `passkey_retrieval_cancelled`
    - `passkey_retrieval_failed`
    - `passkey_registration_cancelled`
    - `passkey_registration_failed`

  - Get the user's passkeys
    `clerk.user.passkeys`
  - Update the name of a passkey
    `clerk.user.passkeys?.[0].update({name:'Company issued passkey'})`
  - Delete a passkey
    `clerk.user.passkeys?.[0].delete()`

## 2.0.0-beta.21

### Patch Changes

- Improve ptBR localizations ([#3083](https://github.com/clerk/javascript/pull/3083)) by [@GustavoOS](https://github.com/GustavoOS)

- Add maintenance mode banner to the SignIn and SignUp components. The text can be customized by updating the maintenanceMode localization key. by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Fix typos from pt-BR localization ([#3106](https://github.com/clerk/javascript/pull/3106)) by [@LauraBeatris](https://github.com/LauraBeatris)

- Added Thai translation keys for pwned password, form identifier, passkey ([#3128](https://github.com/clerk/javascript/pull/3128)) by [@ttwrpz](https://github.com/ttwrpz)

  Change Thai translation keys for Authenticator related to match the context

## 2.0.0-beta.20

### Minor Changes

- Support for prompting a user to reset their password if it is found to be compromised during sign-in. ([#3034](https://github.com/clerk/javascript/pull/3034)) by [@yourtallness](https://github.com/yourtallness)

### Patch Changes

- Adds translation keys to be able to customize error messages when an identifier already exists: ([#3073](https://github.com/clerk/javascript/pull/3073)) by [@octoper](https://github.com/octoper)
  - form_identifier_exists\_\_email_address
  - form_identifier_exists\_\_username
  - form_identifier_exists\_\_phone_number

## 2.0.0-beta.19

### Minor Changes

- Improved error handling for registration and retrieval of passkeys. ([#3025](https://github.com/clerk/javascript/pull/3025)) by [@panteliselef](https://github.com/panteliselef)

  ClerkRuntimeError codes introduced:
  - `passkey_not_supported`
  - `passkeys_pa_not_supported`
  - `passkey_invalid_rpID_or_domain`
  - `passkey_already_exists`
  - `passkey_operation_aborted`
  - `passkey_retrieval_cancelled`
  - `passkey_retrieval_failed`
  - `passkey_registration_cancelled`
  - `passkey_registration_failed`

  Example usage:

  ```ts
  try {
    await __experimental_authenticateWithPasskey(...args);
  }catch (e) {
    if (isClerkRuntimeError(e)) {
        if (err.code === 'passkey_operation_aborted') {
            ...
        }
    }
  }


  ```

### Patch Changes

- Translate EN strings to ES in es-ES.ts ([#3020](https://github.com/clerk/javascript/pull/3020)) by [@pauloconde](https://github.com/pauloconde)

- Added Mongolian (mn-MN) localizations ([#3024](https://github.com/clerk/javascript/pull/3024)) by [@TsPuujee](https://github.com/TsPuujee)

## 2.0.0-beta.18

### Minor Changes

- List passkeys under security in UserProfile. ([#2958](https://github.com/clerk/javascript/pull/2958)) by [@panteliselef](https://github.com/panteliselef)
  - Supports renaming a passkey.
  - Supports deleting a passkey.

- During sign in, navigate to the `reset-password` route if the user needs a new password. This happens when you enforce password usage during sign-in in your dashboard. Previously this case wasn't handled in the password form. ([#2984](https://github.com/clerk/javascript/pull/2984)) by [@yourtallness](https://github.com/yourtallness)

  The `signIn.resetPassword.requiredMessage` localization was updated to `'For security reasons, it is required to reset your password.'`.

- Allow users to authenticate with passkeys via the `<SignIn/>`. ([#3000](https://github.com/clerk/javascript/pull/3000)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Add missing ru-RU translations ([#2961](https://github.com/clerk/javascript/pull/2961)) by [@blackkkout](https://github.com/blackkkout)

- Improve Norwegian translations ([#2963](https://github.com/clerk/javascript/pull/2963)) by [@petter](https://github.com/petter)

- Add missing translation for profile edit button in de-DE ([#3011](https://github.com/clerk/javascript/pull/3011)) by [@dislick](https://github.com/dislick)

- Add Catalan (ca-ES) localizations ([#3006](https://github.com/clerk/javascript/pull/3006)) by [@jorvixsky](https://github.com/jorvixsky)

## 2.0.0-beta.17

### Patch Changes

- Update the danger section in the `es-ES` localization ([#2924](https://github.com/clerk/javascript/pull/2924)) by [@souvik666](https://github.com/souvik666)

## 2.0.0-beta.16

### Minor Changes

- Add Thai (th-TH) localization ([#2874](https://github.com/clerk/javascript/pull/2874)) by [@ttwrpz](https://github.com/ttwrpz)

## 2.0.0-beta.15

### Patch Changes

- Improve Japanese translations ([#2868](https://github.com/clerk/javascript/pull/2868)) by [@gunta](https://github.com/gunta)

## 2.0.0-beta.14

### Patch Changes

- Rename beta-v5 to beta by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.0.0-beta-v5.13

### Patch Changes

- Improve German translations ([#2675](https://github.com/clerk/javascript/pull/2675)) by [@TobiasMaehl-pIX](https://github.com/TobiasMaehl-pIX)

## 2.0.0-beta-v5.12

### Major Changes

- Refresh the look and feel of the Clerk UI components ([#2622](https://github.com/clerk/javascript/pull/2622)) by [@anagstef](https://github.com/anagstef)

  For more info, refer to the [upgrade guide from v4 to v5 in Clerk docs](https://clerk.com/docs/upgrade-guides/upgrading-from-v4-to-v5).

## 2.0.0-alpha-v5.11

### Patch Changes

- Add Bulgarian (bg-BG) localization (#2565) ([#2565](https://github.com/clerk/javascript/pull/2565)) by [@samusarsar](https://github.com/samusarsar)

## 2.0.0-alpha-v5.10

### Minor Changes

- Correct ko-KR strings naturally ([#2533](https://github.com/clerk/javascript/pull/2533)) by [@sunghyunzz](https://github.com/sunghyunzz)

## 2.0.0-alpha-v5.9

### Patch Changes

- Introduce es-MX localization by [@nikosdouvlis](https://github.com/nikosdouvlis)

## 2.0.0-alpha-v5.8

### Patch Changes

- Fix typo in ko-KR.ts ([#2464](https://github.com/clerk/javascript/pull/2464)) by [@FitCoderOfficial](https://github.com/FitCoderOfficial)

## 2.0.0-alpha-v5.7

### Patch Changes

- Update es-ES.ts ([#2341](https://github.com/clerk/javascript/pull/2341)) by [@codesjedi](https://github.com/codesjedi)

## 2.0.0-alpha-v5.6

### Patch Changes

- The package now allows for [subpath exports](https://nodejs.org/api/packages.html#subpath-exports). You can now import specific languages like so: ([#2236](https://github.com/clerk/javascript/pull/2236)) by [@dimkl](https://github.com/dimkl)

  ```diff
  # Single language
  - import { frFR } from "@clerk/localizations"
  + import { frFR } from "@clerk/localizations/fr-FR"

  # Multiple languages
  - import { enUS, esES } from "@clerk/localizations"
  + import { enUS } from "@clerk/localizations/en-US"
  + import { esES } from "@clerk/localizations/es-ES"
  ```

  This helps with tree-shaking and will reduce your total bundle size in most cases.

  You can continue to use the top-level `@clerk/localizations` import as this is a non-breaking change. You can gradually opt-in to this optimization.

## 2.0.0-alpha-v5.5

### Minor Changes

- Add support for Portuguese (Portugal) language ([#2202](https://github.com/clerk/javascript/pull/2202)) by [@SirRamboia](https://github.com/SirRamboia)

## 2.0.0-alpha-v5.4

### Patch Changes

- Add missing localization key for invalid phone_number (unstable error) in the en-US localization ([#2191](https://github.com/clerk/javascript/pull/2191)) by [@royanger](https://github.com/royanger)

## 2.0.0-alpha-v5.3

### Major Changes

- Upgrade React version to >=18 and add react-dom as peer dependency ([#2164](https://github.com/clerk/javascript/pull/2164)) by [@dimkl](https://github.com/dimkl)

  to fix issues with vite & rollup building.

### Patch Changes

- Add missing ru-RU localization keys ([#2167](https://github.com/clerk/javascript/pull/2167)) by [@artemxknpv](https://github.com/artemxknpv)

- Introduce ro-RO localization ([#2175](https://github.com/clerk/javascript/pull/2175)) by [@predam](https://github.com/predam)

## 2.0.0-alpha-v5.2

### Major Changes

- Change the minimal Node.js version required by Clerk to `18.17.0`. ([#2162](https://github.com/clerk/javascript/pull/2162)) by [@dimkl](https://github.com/dimkl)

## 2.0.0-alpha-v5.1

### Major Changes

- Drop deprecations. Migration steps: ([#2151](https://github.com/clerk/javascript/pull/2151)) by [@dimkl](https://github.com/dimkl)
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

### Patch Changes

- Fix zh-TW localization and export zh-TW from index.ts ([#2098](https://github.com/clerk/javascript/pull/2098)) by [@tszhong0411](https://github.com/tszhong0411)

## 1.26.8-alpha-v5.0

### Patch Changes

- Localize placeholder of confirmation field when deleting a user account from `<UserProfile/>`. ([#2036](https://github.com/clerk/javascript/pull/2036)) by [@panteliselef](https://github.com/panteliselef)

## 1.26.7

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Add `dangerSection` translations to the `trTr` translation file ([#1920](https://github.com/clerk/javascript/pull/1920)) by [@EdizKeskin](https://github.com/EdizKeskin)

- Updated dependencies [[`3bf64107e`](https://github.com/clerk/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`b09b66eec`](https://github.com/clerk/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerk/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62)]:
  - @clerk/types@3.57.0

## 1.26.6

### Patch Changes

- Introduce zh-TW localization ([#1884](https://github.com/clerk/javascript/pull/1884)) by [@15077693d](https://github.com/15077693d)

- Updated dependencies [[`9ca215702`](https://github.com/clerk/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11)]:
  - @clerk/types@3.56.1

## 1.26.5

### Patch Changes

- Updated dependencies [[`35be8709d`](https://github.com/clerk/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`e38488c92`](https://github.com/clerk/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerk/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`a9894b445`](https://github.com/clerk/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`70f251007`](https://github.com/clerk/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`a46d6fe99`](https://github.com/clerk/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/types@3.56.0

## 1.26.4

### Patch Changes

- Add missing strings in Hebrew localization ([#1852](https://github.com/clerk/javascript/pull/1852)) by [@shadoworion](https://github.com/shadoworion)

- Updated dependencies [[`997b8e256`](https://github.com/clerk/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91e9a55f4`](https://github.com/clerk/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`91014880d`](https://github.com/clerk/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`7f4d4b942`](https://github.com/clerk/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b)]:
  - @clerk/types@3.55.0

## 1.26.3

### Patch Changes

- Introduce ClerkRuntimeError class for localizing error messages in ClerkJS components ([#1813](https://github.com/clerk/javascript/pull/1813)) by [@panteliselef](https://github.com/panteliselef)

- Enables you to translate the tooltip hint while creating an organization through the `formFieldHintText__slug` key ([#1811](https://github.com/clerk/javascript/pull/1811)) by [@LekoArts](https://github.com/LekoArts)

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Add German translation for `deletePage` section ([#1797](https://github.com/clerk/javascript/pull/1797)) by [@Vintotan](https://github.com/Vintotan)

- Add Arabic translations (ar-SA) ([#1815](https://github.com/clerk/javascript/pull/1815)) by [@MohanadOO](https://github.com/MohanadOO)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerk/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`164f3aac7`](https://github.com/clerk/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerk/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerk/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`9514618d6`](https://github.com/clerk/javascript/commit/9514618d65cfdde0ff011eabd41a992b61fc8dc1), [`c7c6912f3`](https://github.com/clerk/javascript/commit/c7c6912f34874467bc74104690fe9f95491cc10d), [`71bb1c7b5`](https://github.com/clerk/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf)]:
  - @clerk/types@3.54.0

## 1.26.2

### Patch Changes

- Fix: localized key for invalid email addresses in InviteMembers form. ([#1781](https://github.com/clerk/javascript/pull/1781)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`5c8754239`](https://github.com/clerk/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81)]:
  - @clerk/types@3.53.0

## 1.26.1

### Patch Changes

- Adds the ability to force users to reset their password. ([#1757](https://github.com/clerk/javascript/pull/1757)) by [@kostaspt](https://github.com/kostaspt)

- Updated dependencies [[`c61ddf5bf`](https://github.com/clerk/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerk/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/types@3.52.1

## 1.26.0

### Minor Changes

- Introduce the new brand-new component OrganizationList ([#1692](https://github.com/clerk/javascript/pull/1692)) by [@panteliselef](https://github.com/panteliselef)
  - Lists all the memberships, invitations or suggestions an active user may have
  - Powered by our `useOrganizationList` react hook

- Review PT-BR localizations, translate organization strings ([#1710](https://github.com/clerk/javascript/pull/1710)) by [@danilofuchs](https://github.com/danilofuchs)

### Patch Changes

- Improve README by adding instructions on how to add/edit localizations ([#1747](https://github.com/clerk/javascript/pull/1747)) by [@LekoArts](https://github.com/LekoArts)

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- This PR replaces `The verification link expired. Please resend it.` message with the localization key `formFieldError__verificationLinkExpired`. The english message was also adjust to `The verification link expired. Please request a new link.` to make the second sentence clearer. ([#1738](https://github.com/clerk/javascript/pull/1738)) by [@LekoArts](https://github.com/LekoArts)

- Update "unverified" email and phone labels ([#1716](https://github.com/clerk/javascript/pull/1716)) by [@panteliselef](https://github.com/panteliselef)

- Updated dependencies [[`e99df0a0d`](https://github.com/clerk/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerk/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`01b024c57`](https://github.com/clerk/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68)]:
  - @clerk/types@3.52.0

## 1.25.2

### Patch Changes

- Organization Switcher now displays organization invitations and suggestions in a more compact form. ([#1675](https://github.com/clerk/javascript/pull/1675)) by [@panteliselef](https://github.com/panteliselef)

- Update pl-Pl localization ([#1678](https://github.com/clerk/javascript/pull/1678)) by [@dawid-grabowski](https://github.com/dawid-grabowski)

- Updated dependencies [[`463ff84f5`](https://github.com/clerk/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`1426e5eb3`](https://github.com/clerk/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739)]:
  - @clerk/types@3.51.0

## 1.25.1

### Patch Changes

- Update "personal workspace" label to "personal account" ([#1648](https://github.com/clerk/javascript/pull/1648)) by [@panteliselef](https://github.com/panteliselef)

## 1.25.0

### Minor Changes

- Add uk-UA localization ([#1558](https://github.com/clerk/javascript/pull/1558)) by [@demptd13](https://github.com/demptd13)

### Patch Changes

- Introduces Membership Requests in <OrganizationProfile /> ([#1576](https://github.com/clerk/javascript/pull/1576)) by [@panteliselef](https://github.com/panteliselef)
  - This is a list of users that have requested to join the active organization

- Introduces domains and invitations in <OrganizationProfile /> ([#1560](https://github.com/clerk/javascript/pull/1560)) by [@panteliselef](https://github.com/panteliselef)
  - The "Members" page now accommodates Domain and Individual invitations
  - The "Settings" page allows for the addition, edit and removal of a domain

- Add missing account deletion description to Korean translation file ([#1609](https://github.com/clerk/javascript/pull/1609)) by [@JungHoonGhae](https://github.com/JungHoonGhae)

- A OrganizationMembershipRequest can now be rejected ([#1612](https://github.com/clerk/javascript/pull/1612)) by [@panteliselef](https://github.com/panteliselef)
  - New `OrganizationMembershipRequest.reject` method alongside `accept`
  - As an organization admin, navigate to `Organization Profile` > `Members` > `Requests`. You can now reject a request from the table.

- Introduces an invitation list within <OrganizationSwitcher/> ([#1554](https://github.com/clerk/javascript/pull/1554)) by [@panteliselef](https://github.com/panteliselef)
  - Users can accept the invitation that is sent to them

- When updating enrollment mode of a domain uses can now delete any pending invitations or suggestions. ([#1632](https://github.com/clerk/javascript/pull/1632)) by [@panteliselef](https://github.com/panteliselef)

- Add translations for deleteOrganization and domainSection objects to Korean ([#1630](https://github.com/clerk/javascript/pull/1630)) by [@JungHoonGhae](https://github.com/JungHoonGhae)

- Introduces list of suggestions within <OrganizationSwitcher/> ([#1577](https://github.com/clerk/javascript/pull/1577)) by [@panteliselef](https://github.com/panteliselef)
  - Users can request to join a suggested organization

- Updated dependencies [[`96cc1921c`](https://github.com/clerk/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerk/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerk/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerk/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerk/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerk/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerk/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerk/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerk/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerk/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`86de584dd`](https://github.com/clerk/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`e02a1aff2`](https://github.com/clerk/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`09bfb793e`](https://github.com/clerk/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerk/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerk/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerk/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerk/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`89bc5de04`](https://github.com/clerk/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/types@3.50.0

## 1.24.1

### Patch Changes

- Add more translations to fr-FR ([#1529](https://github.com/clerk/javascript/pull/1529)) by [@PierreC1024](https://github.com/PierreC1024)

- New localization keys for max length exceeded validation: ([#1521](https://github.com/clerk/javascript/pull/1521)) by [@nikospapcom](https://github.com/nikospapcom)
  - Organization name (form_param_max_length_exceeded\_\_name)
  - First name (form_param_max_length_exceeded\_\_first_name)
  - Last name (form_param_max_length_exceeded\_\_last_name)

- Updated dependencies [[`ea95525a4`](https://github.com/clerk/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerk/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`d433b83b9`](https://github.com/clerk/javascript/commit/d433b83b92c61752917f62cc410a774813f38fd7), [`5e1a09df4`](https://github.com/clerk/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`0a59e122d`](https://github.com/clerk/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/types@3.49.0

## 1.24.0

### Minor Changes

- Introduce sk-SK localization ([#1515](https://github.com/clerk/javascript/pull/1515)) by [@l0st0](https://github.com/l0st0)

## 1.23.2

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerk/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3)]:
  - @clerk/types@3.48.1

## 1.23.1

### Patch Changes

- Update de-DE localization file ([#1496](https://github.com/clerk/javascript/pull/1496)) by [@mwerder](https://github.com/mwerder)

- Updated dependencies [[`2a9d83280`](https://github.com/clerk/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c)]:
  - @clerk/types@3.48.0

## 1.23.0

### Minor Changes

- Add a confirmation input as an additional check when doing destructive actions such as: ([#1454](https://github.com/clerk/javascript/pull/1454)) by [@raptisj](https://github.com/raptisj)
  - delete an organization
  - delete a user account
  - leave an organization

  Νew localization keys were introduced to support the above

- Add el-GR localization ([#1479](https://github.com/clerk/javascript/pull/1479)) by [@EmmanouelaPothitou](https://github.com/EmmanouelaPothitou)

### Patch Changes

- Add `form_username_invalid_character` unstable error localization key. ([#1475](https://github.com/clerk/javascript/pull/1475)) by [@desiprisg](https://github.com/desiprisg)

- Add missing "delete account" French translations ([#1487](https://github.com/clerk/javascript/pull/1487)) by [@selimjouan](https://github.com/selimjouan)

- Updated dependencies [[`73c9c1d0e`](https://github.com/clerk/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerk/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerk/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`090bab66e`](https://github.com/clerk/javascript/commit/090bab66e295bff2358115d2cbd3ed0e603b5ff5), [`592911196`](https://github.com/clerk/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8)]:
  - @clerk/types@3.47.0

## 1.22.1

### Patch Changes

- Introduce Polish localization (pl-PL) ([#1457](https://github.com/clerk/javascript/pull/1457)) by [@teceer](https://github.com/teceer)

## 1.22.0

### Minor Changes

- Add vi-VN translations ([#1409](https://github.com/clerk/javascript/pull/1409)) by [@kungfu321](https://github.com/kungfu321)

### Patch Changes

- Add missing translations in de-DE.ts ([#1414](https://github.com/clerk/javascript/pull/1414)) by [@Yardie83](https://github.com/Yardie83)

- Updated dependencies [[`30f8ad18a`](https://github.com/clerk/javascript/commit/30f8ad18a4f85ca2e3fda46e5c180b28bc8fb47c)]:
  - @clerk/types@3.46.1

## 1.21.1

### Patch Changes

- Add missing `fr-FR` translations for reset password page ([#1398](https://github.com/clerk/javascript/pull/1398)) by [@kohort-aymeric](https://github.com/kohort-aymeric)

- Make resend link/code message clearer. ([#1390](https://github.com/clerk/javascript/pull/1390)) by [@desiprisg](https://github.com/desiprisg)

- Add missing pt-BR translations ([#1388](https://github.com/clerk/javascript/pull/1388)) by [@Gustavo-Pauli](https://github.com/Gustavo-Pauli)

## 1.21.0

### Minor Changes

- Add ability for organization admins to delete an organization if they have permission to do so ([#1368](https://github.com/clerk/javascript/pull/1368)) by [@jescalan](https://github.com/jescalan)

### Patch Changes

- Updated dependencies [[`bfb3af28`](https://github.com/clerk/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/types@3.46.0

## 1.20.1

### Patch Changes

- Updated dependencies [[`11954816`](https://github.com/clerk/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`32148490`](https://github.com/clerk/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/types@3.45.0

## 1.20.0

### Minor Changes

- Add localization keys for when the phone number exists and the last identification is deleted ([#1383](https://github.com/clerk/javascript/pull/1383)) by [@raptisj](https://github.com/raptisj)

### Patch Changes

- Add missing fr-FR translations (use_email & use_phone) ([#1379](https://github.com/clerk/javascript/pull/1379)) by [@kohort-aymeric](https://github.com/kohort-aymeric)

- Updated dependencies [[`17cc14ec`](https://github.com/clerk/javascript/commit/17cc14ec64ed292239ee782662171a4a8cbd9e87)]:
  - @clerk/types@3.44.0

## 1.19.0

### Minor Changes

- Adds the ability for users to delete their own accounts, as long as they have permission to do so ([#1307](https://github.com/clerk/javascript/pull/1307)) by [@jescalan](https://github.com/jescalan)

- Introduce `nb-NO` localization ([#1376](https://github.com/clerk/javascript/pull/1376)) by [@Richard87](https://github.com/Richard87)

### Patch Changes

- Fix "Sign in" text for the Korean localization ([#1371](https://github.com/clerk/javascript/pull/1371)) by [@perkinsjr](https://github.com/perkinsjr)

- Updated dependencies [[`9651658c`](https://github.com/clerk/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerk/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/types@3.43.0

## 1.18.1

### Patch Changes

- Add more fr-FR translations ([#1364](https://github.com/clerk/javascript/pull/1364)) by [@selimjouan](https://github.com/selimjouan)

## 1.18.0

### Minor Changes

- feat(localizations): Add ko-KR localization ([#1339](https://github.com/clerk/javascript/pull/1339)) by [@deutschkihun](https://github.com/deutschkihun)

### Patch Changes

- Updated dependencies [[`c42b4ac0`](https://github.com/clerk/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963)]:
  - @clerk/types@3.42.0

## 1.17.1

### Patch Changes

- fix(types,localizations): Improve invalid form email_address param error message by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Make first name, last name & password readonly for users with active SAML accounts by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/types@3.41.1

## [1.17.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.17.0-staging.2...@clerk/localizations@1.17.0) (2023-06-03)

### Features

- add zh-CN localization ([#1284](https://github.com/clerk/javascript/issues/1284)) ([bc3ba51](https://github.com/clerk/javascript/commit/bc3ba51dae2c9ee46138cfe65194ea4a78d5ce36))

### Bug Fixes

- **localizations:** Export zhCN ([b67d523](https://github.com/clerk/javascript/commit/b67d5234bf0a84217b1cf5cae439c6089912f9ee))

## [1.16.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.16.0-staging.0...@clerk/localizations@1.16.0) (2023-05-26)

**Note:** Version bump only for package @clerk/localizations

### [1.15.1](https://github.com/clerk/javascript/compare/@clerk/localizations@1.15.1-staging.2...@clerk/localizations@1.15.1) (2023-05-23)

**Note:** Version bump only for package @clerk/localizations

## [1.15.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.15.0-staging.0...@clerk/localizations@1.15.0) (2023-05-18)

**Note:** Version bump only for package @clerk/localizations

## [1.14.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.14.0-staging.1...@clerk/localizations@1.14.0) (2023-05-17)

**Note:** Version bump only for package @clerk/localizations

## [1.13.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.13.0-staging.3...@clerk/localizations@1.13.0) (2023-05-15)

**Note:** Version bump only for package @clerk/localizations

## [1.12.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.12.0-staging.4...@clerk/localizations@1.12.0) (2023-05-04)

**Note:** Version bump only for package @clerk/localizations

## [1.12.0-staging.4](https://github.com/clerk/javascript/compare/@clerk/localizations@1.12.0-staging.3...@clerk/localizations@1.12.0-staging.4) (2023-05-04)

**Note:** Version bump only for package @clerk/localizations

## [1.12.0-staging.3](https://github.com/clerk/javascript/compare/@clerk/localizations@1.12.0-staging.2...@clerk/localizations@1.12.0-staging.3) (2023-05-02)

### Features

- **clerk-js:** Create <ResetPasswordSuccess /> page ([3fbf8e7](https://github.com/clerk/javascript/commit/3fbf8e7157774412096ff432e622540ae2d96ef4))
- **clerk-js:** Introduce Reset Password flow ([e903c4f](https://github.com/clerk/javascript/commit/e903c4f430ae629625177637bb14f965a37596e1))
- **clerk-js:** Localize "Password don't match" field error ([c573599](https://github.com/clerk/javascript/commit/c573599a370d4f3925d0e8a87b37f28f157bb62b))
- **clerk-js:** Reset password for first factor ([280b5df](https://github.com/clerk/javascript/commit/280b5df2428b790e679a04004461aadb2717ae2b))

### Bug Fixes

- **clerk-js:** Reset Password missing localization keys ([b1df074](https://github.com/clerk/javascript/commit/b1df074ad203e07b55b0051c9f97d4fd26e0fde5))
- **clerk-js:** Update type of resetPasswordFlow in SignInResource ([637b791](https://github.com/clerk/javascript/commit/637b791b0086be35a67e7d8a6a0e7c42989296b5))
- **localizations:** Make emailAddresses GE translation consistent ([#1117](https://github.com/clerk/javascript/issues/1117)) ([0e84519](https://github.com/clerk/javascript/commit/0e84519316c43770b2174c17a412854c335a3643))

### [1.11.3](https://github.com/clerk/javascript/compare/@clerk/localizations@1.11.3-staging.0...@clerk/localizations@1.11.3) (2023-04-19)

**Note:** Version bump only for package @clerk/localizations

### [1.11.2](https://github.com/clerk/javascript/compare/@clerk/localizations@1.11.1...@clerk/localizations@1.11.2) (2023-04-19)

**Note:** Version bump only for package @clerk/localizations

### [1.11.1](https://github.com/clerk/javascript/compare/@clerk/localizations@1.11.1-staging.0...@clerk/localizations@1.11.1) (2023-04-12)

**Note:** Version bump only for package @clerk/localizations

## [1.11.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.11.0-staging.2...@clerk/localizations@1.11.0) (2023-04-11)

**Note:** Version bump only for package @clerk/localizations

## [1.10.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.10.0-staging.0...@clerk/localizations@1.10.0) (2023-04-06)

**Note:** Version bump only for package @clerk/localizations

### [1.9.1](https://github.com/clerk/javascript/compare/@clerk/localizations@1.9.1-staging.2...@clerk/localizations@1.9.1) (2023-03-31)

**Note:** Version bump only for package @clerk/localizations

## [1.9.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.9.0-staging.0...@clerk/localizations@1.9.0) (2023-03-29)

**Note:** Version bump only for package @clerk/localizations

### [1.7.1](https://github.com/clerk/javascript/compare/@clerk/localizations@1.7.1-staging.2...@clerk/localizations@1.7.1) (2023-03-10)

**Note:** Version bump only for package @clerk/localizations

## [1.7.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.7.0-staging.0...@clerk/localizations@1.7.0) (2023-03-09)

**Note:** Version bump only for package @clerk/localizations

## [1.6.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.6.0-staging.0...@clerk/localizations@1.6.0) (2023-03-07)

**Note:** Version bump only for package @clerk/localizations

### [1.5.3](https://github.com/clerk/javascript/compare/@clerk/localizations@1.5.3-staging.1...@clerk/localizations@1.5.3) (2023-03-03)

**Note:** Version bump only for package @clerk/localizations

### [1.5.2](https://github.com/clerk/javascript/compare/@clerk/localizations@1.5.2-staging.0...@clerk/localizations@1.5.2) (2023-03-01)

**Note:** Version bump only for package @clerk/localizations

### [1.5.1](https://github.com/clerk/javascript/compare/@clerk/localizations@1.5.1-staging.0...@clerk/localizations@1.5.1) (2023-02-25)

**Note:** Version bump only for package @clerk/localizations

## [1.5.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.5.0-staging.1...@clerk/localizations@1.5.0) (2023-02-24)

### Features

- **localizations:** Improve de-DE translations ([#796](https://github.com/clerk/javascript/issues/796)) ([8d595a5](https://github.com/clerk/javascript/commit/8d595a549c6b6c79c9dbfb2460119d7aaa32b66b))

## [1.5.0-staging.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.4.5-staging.1...@clerk/localizations@1.5.0-staging.0) (2023-02-22)

### Features

- **localizations:** Add spanish localization ([2379cde](https://github.com/clerk/javascript/commit/2379cdecbb98a58c761b499a465fc457d852ba4d))
- **localizations:** Add spanish localization ([381a6c1](https://github.com/clerk/javascript/commit/381a6c19788ecdd9e435e826d10a5ebd36e6b326))
- **localizations:** Add spanish localization ([97a6208](https://github.com/clerk/javascript/commit/97a620885a15744f5116021262aa9daae9257268))

### [1.4.4](https://github.com/clerk/javascript/compare/@clerk/localizations@1.4.4-staging.0...@clerk/localizations@1.4.4) (2023-02-17)

**Note:** Version bump only for package @clerk/localizations

### [1.4.3](https://github.com/clerk/javascript/compare/@clerk/localizations@1.4.3-staging.1...@clerk/localizations@1.4.3) (2023-02-15)

**Note:** Version bump only for package @clerk/localizations

### [1.4.2](https://github.com/clerk/javascript/compare/@clerk/localizations@1.4.2-staging.1...@clerk/localizations@1.4.2) (2023-02-10)

**Note:** Version bump only for package @clerk/localizations

### [1.4.1](https://github.com/clerk/javascript/compare/@clerk/localizations@1.4.1-staging.0...@clerk/localizations@1.4.1) (2023-02-07)

**Note:** Version bump only for package @clerk/localizations

### [1.4.1-staging.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.4.0...@clerk/localizations@1.4.1-staging.0) (2023-02-07)

**Note:** Version bump only for package @clerk/localizations

## [1.4.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.3.2-staging.1...@clerk/localizations@1.4.0) (2023-02-07)

**Note:** Version bump only for package @clerk/localizations

### [1.3.1](https://github.com/clerk/javascript/compare/@clerk/localizations@1.3.1-staging.1...@clerk/localizations@1.3.1) (2023-02-01)

**Note:** Version bump only for package @clerk/localizations

## [1.3.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.3.0-staging.0...@clerk/localizations@1.3.0) (2023-01-27)

**Note:** Version bump only for package @clerk/localizations

### [1.2.3](https://github.com/clerk/javascript/compare/@clerk/localizations@1.2.3-staging.0...@clerk/localizations@1.2.3) (2023-01-24)

**Note:** Version bump only for package @clerk/localizations

### [1.2.2](https://github.com/clerk/javascript/compare/@clerk/localizations@1.2.1...@clerk/localizations@1.2.2) (2023-01-20)

**Note:** Version bump only for package @clerk/localizations

### [1.2.1](https://github.com/clerk/javascript/compare/@clerk/localizations@1.2.1-staging.2...@clerk/localizations@1.2.1) (2023-01-17)

**Note:** Version bump only for package @clerk/localizations

## [1.2.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.2.0-staging.0...@clerk/localizations@1.2.0) (2022-12-23)

**Note:** Version bump only for package @clerk/localizations

### [1.1.5](https://github.com/clerk/javascript/compare/@clerk/localizations@1.1.5-staging.1...@clerk/localizations@1.1.5) (2022-12-19)

**Note:** Version bump only for package @clerk/localizations

### [1.1.4](https://github.com/clerk/javascript/compare/@clerk/localizations@1.1.4-staging.0...@clerk/localizations@1.1.4) (2022-12-13)

**Note:** Version bump only for package @clerk/localizations

### [1.1.3](https://github.com/clerk/javascript/compare/@clerk/localizations@1.1.2...@clerk/localizations@1.1.3) (2022-12-12)

**Note:** Version bump only for package @clerk/localizations

### [1.1.2](https://github.com/clerk/javascript/compare/@clerk/localizations@1.1.2-staging.1...@clerk/localizations@1.1.2) (2022-12-09)

**Note:** Version bump only for package @clerk/localizations

### [1.1.1](https://github.com/clerk/javascript/compare/@clerk/localizations@1.1.0...@clerk/localizations@1.1.1) (2022-12-08)

**Note:** Version bump only for package @clerk/localizations

## [1.1.0](https://github.com/clerk/javascript/compare/@clerk/localizations@1.1.0-staging.0...@clerk/localizations@1.1.0) (2022-12-08)

**Note:** Version bump only for package @clerk/localizations
