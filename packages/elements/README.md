<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_elements" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/elements

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_elements)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/elements/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://github.com/clerk/javascript/issues/new?assignees=&labels=feature-request&projects=&template=FEATURE_REQUEST.yml)
·
[Ask a Question](https://github.com/clerk/javascript/discussions)

</div>

---

## Overview

Clerk is the easiest way to add authentication and user management to your React application. Add sign up, sign in, and profile management to your application in minutes.

## Package Development

```sh
turbo dev --filter=elements
```

### Examples NextJS Development

#### Setup:

```sh
cd examples/nextjs && npm i
```

#### Development Server:

Changes in the `packages/elements` directory will be hotloaded in the example app.

```sh
npm run app:dev

# With the XState Inspector
NEXT_PUBLIC_CLERK_ELEMENTS_DEBUG=true npm run app:dev
```

#### E2E Testing

```sh
cd examples/nextjs && npm run e2e

# With UI: https://playwright.dev/docs/running-tests#run-tests-in-ui-mode
npm run e2e -- --ui

# Headed Mode: https://playwright.dev/docs/running-tests#run-tests-in-headed-mode
npm run e2e -- --headed

# Specific Tests: https://playwright.dev/docs/running-tests#run-specific-tests
npm run e2e -- e2e/elements.spec.ts
```

### Flows

Flows per `clerk-js` UI components

#### `<SignInRoutes>`

```
/sign-in
  /factor-one               <SignInFactorOne />
  /factor-two               <SignInFactorTwo />
  /reset-password           <ResetPassword />
  /reset-password-success   <ResetPasswordSuccess />
  /sso-callback             <SignInSSOCallback {...} />
  /choose                   <SignInAccountSwitcher />
  /verify                   <SignInEmailLinkFlowComplete {...} />
  /                         <SignInStart />
  [ELSE]                    <RedirectToSignIn />
```

#### `<SignUpRoutes>`

```
/sign-up
  /verify-email-address     <SignUpVerifyEmail />                 [Guarded: Boolean(clerk.client.signUp.emailAddress)]
  /verify-phone-number      <SignUpVerifyPhone />                 [Guarded: Boolean(clerk.client.signUp.phoneNumber)]
  /sso-callback             <SignUpSSOCallback {...} />
  /verify                   <SignUpEmailLinkFlowComplete {...} />
  /continue
    /verify-email-address   <SignUpVerifyEmail />                 [Guarded: Boolean(clerk.client.signUp.emailAddress)]
    /verify-phone-number    <SignUpVerifyPhone />                 [Guarded: Boolean(clerk.client.signUp.phoneNumber)]
    /                       <SignUpContinue />
  /                         <SignUpStart />
  [ELSE]                    <RedirectToSignUp />

/sign-up
  /verify-email-address     <SignUpVerifyEmail />                 [Guarded: Boolean(clerk.client.signUp.emailAddress)]
  /verify-phone-number      <SignUpVerifyPhone />                 [Guarded: Boolean(clerk.client.signUp.phoneNumber)]
  /sso-callback             <SignUpSSOCallback {...} />
  /verify                   <SignUpEmailLinkFlowComplete {...} />
  /continue
    /                       <SignUpContinue />
  /                         <SignUpStart />
  [ELSE]                    <RedirectToSignUp />
```
