# @clerk/ui

## 0.1.13

### Patch Changes

- Updated dependencies [[`6f562876315750bbe066efe25e2257fdbfcf1b73`](https://github.com/clerk/javascript/commit/6f562876315750bbe066efe25e2257fdbfcf1b73), [`6f562876315750bbe066efe25e2257fdbfcf1b73`](https://github.com/clerk/javascript/commit/6f562876315750bbe066efe25e2257fdbfcf1b73)]:
  - @clerk/elements@0.18.2
  - @clerk/shared@2.11.2

## 0.1.11

### Patch Changes

- Updated dependencies [[`f875463da`](https://github.com/clerk/javascript/commit/f875463da9692f2d173b6d5388743cf720750ae3), [`5be7ca9fd`](https://github.com/clerk/javascript/commit/5be7ca9fd239c937cc88e20ce8f5bfc9f3b84f22), [`08c5a2add`](https://github.com/clerk/javascript/commit/08c5a2add6872c76e62fc0df06db723e3728452e), [`434b432f8`](https://github.com/clerk/javascript/commit/434b432f8c114825120eef0f2c278b8142ed1563), [`434b432f8`](https://github.com/clerk/javascript/commit/434b432f8c114825120eef0f2c278b8142ed1563)]:
  - @clerk/types@4.29.0
  - @clerk/elements@0.18.0
  - @clerk/shared@2.11.0

## 0.1.10

### Patch Changes

- Update internal dependencies to use public version ranges instead of file-based paths ([#4397](https://github.com/clerk/javascript/pull/4397)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`3fdcdbf88`](https://github.com/clerk/javascript/commit/3fdcdbf88c38facf8b82563f634ec1b6604fd8e5)]:
  - @clerk/types@4.28.0
  - @clerk/elements@0.17.1
  - @clerk/shared@2.10.1

## 0.1.9

### Patch Changes

- Add initial support for the `appearance` prop ([#3976](https://github.com/clerk/javascript/pull/3976)) by [@dstaley](https://github.com/dstaley)

- Updated dependencies [[`f0b02ee48`](https://github.com/clerk/javascript/commit/f0b02ee48710b3b939cc885123088e3919d9c233), [`c63a5adf0`](https://github.com/clerk/javascript/commit/c63a5adf0ba4b99252146f168318f51b709bb5dd), [`75d575ac5`](https://github.com/clerk/javascript/commit/75d575ac5af7c6da2f0c6aaac2a33f98386bb141), [`8823c21a2`](https://github.com/clerk/javascript/commit/8823c21a26bc81cbc3ed007908b1a9ea474bd343), [`95ac67a14`](https://github.com/clerk/javascript/commit/95ac67a143c263bef0c1f589728566ab8f95768d), [`a0cb062fa`](https://github.com/clerk/javascript/commit/a0cb062faa4d23bef7a577e5cc486f4c5efe6bfa), [`746b4ed5e`](https://github.com/clerk/javascript/commit/746b4ed5e2007505d5850a2a728484809474d7bf), [`2aaf91d81`](https://github.com/clerk/javascript/commit/2aaf91d81bf1e7b8fdc2662c253a26048c787994)]:
  - @clerk/elements@0.15.0
  - @clerk/clerk-react@5.8.0
  - @clerk/types@4.20.0
  - @clerk/shared@2.7.0

## 0.1.8

### Patch Changes

- In certain situations the Frontend API response contains [`supported_first_factors`](https://clerk.com/docs/reference/frontend-api/tag/Sign-Ins#operation/createSignIn!c=200&path=response/supported_first_factors&t=response) with a `null` value while the current code always assumed to receive an array. `SignInResource['supportedFirstFactors']` has been updated to account for that and any code accessing this value has been made more resilient against `null` values. ([#3938](https://github.com/clerk/javascript/pull/3938)) by [@dstaley](https://github.com/dstaley)

- Updated dependencies [[`1743e49db`](https://github.com/clerk/javascript/commit/1743e49dbe79a53b334a40e8133dd1b9b19b8962), [`7e0ced3da`](https://github.com/clerk/javascript/commit/7e0ced3da94f41056bc4445d163d3b615afb6ab1), [`755b3d02b`](https://github.com/clerk/javascript/commit/755b3d02b7117919ff9ae93fa5093ef49b13a5f8), [`b6f0613dc`](https://github.com/clerk/javascript/commit/b6f0613dc9d8b0bab41cfabbaa8621b126e3bdf5)]:
  - @clerk/elements@0.13.0
  - @clerk/shared@2.5.1
  - @clerk/clerk-react@5.4.1
  - @clerk/types@4.13.1

## 0.1.7

### Patch Changes

- Updated dependencies [[`427fcdeaa`](https://github.com/clerk/javascript/commit/427fcdeaaba4e77273be29b4d7cca43f9aa18693)]:
  - @clerk/clerk-react@5.2.7
  - @clerk/elements@0.10.1

## 0.1.6

### Patch Changes

- Updated dependencies [[`c09a0afe0`](https://github.com/clerk/javascript/commit/c09a0afe00a6ea911de7271fc3d11f839aacf6f7), [`0565d54d4`](https://github.com/clerk/javascript/commit/0565d54d493b7d6f5b3de48871c54061dd43e3ef), [`168607a56`](https://github.com/clerk/javascript/commit/168607a569cb6d4be3f93c5409b6aa6606e9580b), [`8c6dfd6fc`](https://github.com/clerk/javascript/commit/8c6dfd6fc910c1942d4b04f80a161d7e979a0047), [`168607a56`](https://github.com/clerk/javascript/commit/168607a569cb6d4be3f93c5409b6aa6606e9580b), [`022c0f8c4`](https://github.com/clerk/javascript/commit/022c0f8c46a63465219dfa2b7b2ff196e5624fce)]:
  - @clerk/elements@0.10.0

## 0.1.5

### Patch Changes

- Updated dependencies [[`d6b5006c4`](https://github.com/clerk/javascript/commit/d6b5006c4cc1b6f07bb3a6832b4ec6e65ea15814)]:
  - @clerk/types@4.7.0
  - @clerk/elements@0.9.2
  - @clerk/clerk-react@5.2.6
  - @clerk/shared@2.3.2

## 0.1.4

### Patch Changes

- Updated dependencies [[`5914e8017`](https://github.com/clerk/javascript/commit/5914e801750fb96096ac3807ed29a25bec31eacf)]:
  - @clerk/elements@0.9.1

## 0.1.3

### Patch Changes

- Updated dependencies [[`25c87f693`](https://github.com/clerk/javascript/commit/25c87f6933d655f50bb49e6f5b8c9497d8913ddb), [`5aedc291c`](https://github.com/clerk/javascript/commit/5aedc291c5fa0093aa6884f093bcdc331282eedd), [`6d07aa6f3`](https://github.com/clerk/javascript/commit/6d07aa6f333f796bf09a6f1270e5480120765425)]:
  - @clerk/elements@0.9.0

## 0.1.2

### Patch Changes

- Updated dependencies [[`1273b04ec`](https://github.com/clerk/javascript/commit/1273b04ecf1866b59ef59a74abe31dbcc726da2c), [`b8acf30a7`](https://github.com/clerk/javascript/commit/b8acf30a7c2e3a484f20f3586e8316fc1d3cc390), [`c44925501`](https://github.com/clerk/javascript/commit/c449255011ad65aa0a409facb90fce46b5f2b6be)]:
  - @clerk/types@4.6.1
  - @clerk/elements@0.8.0
  - @clerk/clerk-react@5.2.5
  - @clerk/shared@2.3.1

## 0.1.1

### Patch Changes

- Updated dependencies [[`4ec3f63e2`](https://github.com/clerk/javascript/commit/4ec3f63e26d8d3725a7ba9bbf988a7776fe893ff)]:
  - @clerk/elements@0.7.0
  - @clerk/clerk-react@5.2.4
