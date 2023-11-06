<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_localizations" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/localizations

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_localizations)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/localizations/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://github.com/clerk/javascript/issues/new?assignees=&labels=feature-request&projects=&template=FEATURE_REQUEST.yml)
·
[Ask a Question](https://github.com/clerk/javascript/discussions)

</div>

---

## Overview

Clerk offers the ability to override the strings for all of the elements in each of the Clerk Components. This allows you to provide localization for your users or change the wording to suit your brand.

`@clerk/localizations` contains localized strings for applications using Clerk. If you found a typo, inaccuracies, or want to contribute a new language, please submit a PR and follow the [contributing guide](#contributing).

## Getting Started

### Prerequisites

- Clerk

### Installation

```shell
npm install @clerk/localizations
```

### Build

```shell
npm run build
```

## Usage

`@clerk/localizations` contains predefined localizations you can use:

```javascript
import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { frFR } from '@clerk/localizations';

function App() {
  return (
    <ClerkProvider localization={frFR}>
      <div>Hello from clerk</div>
    </ClerkProvider>
  );
}

export default App;
```

You can also provide your own localization:

```javascript
import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

const localization = {
  socialButtonsBlockButton: 'Sign In with {{provider|titleize}}',
};

function App() {
  return (
    <ClerkProvider localization={localization}>
      <div>Hello from clerk</div>
    </ClerkProvider>
  );
}

export default App;
```

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Create a [GitHub Discussion](https://github.com/clerk/javascript/discussions)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_localizations)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md).

### Adding a new localization key

1. Open the [`types/src/localization.ts`](https://github.com/clerk/javascript/blob/main/packages/types/src/localization.ts) file to add a new key to the `_LocalizationResource` type.

   Naming things is hard, so try these things first: Has the component that should contain the new key already other localizations? If yes, see how they are named and if you could follow that pattern. For example, the `<SignIn />` component has keys with `signIn.start.title`, then I'd make sense to follow the `signIn.` pattern. If you're not sure, take your best guess and the maintainers will comment on the PR!

   An exception to that are any errors that might be returned from the Frontend API. They need to go into the `unstable__errors` object inside each localization.

1. Run `npm build` to compile `types` with your new key

1. Open the [`localizations/src/en-US.ts`](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts) file and add your new key to the object. `en-US` is the default language. If you feel comfortable adding your message in another language than English, feel free to also edit other files.

1. Use the new localization key inside the component. There are two ways:

   - The string is inside a component like `<Text>`:

     ```diff
     - <Text>Role</Text>
     + <Text localizationKey={localizationKeys('formFieldLabel__role')} />
     ```

   - The string is used in a function call:

     ```diff
     + const { t } = useLocalizations();

     - card.setError('Some Error')
     + card.setError(t(localizationKeys('some_error')))
     ```

   You'll need to import `localizationKeys` and `useLocalizations` when using them.

### Updating a localization key

1. Open the [`localizations/src/en-US.ts`](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts) file and search for the text you want to update.

1. Update the text inside `en-US`. If possible, also update other languages.

### Adding a new localization language

1. Create a new file that follows the [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) format

1. Copy the contents of the `en-US.ts` file and translate all keys where necessary. Empty strings can stay empty. You don't need to translate things word by word, adjust where necessary as long as the same meaning is conveyed.

## Security

`@clerk/localizations` follows good practices of security, but 100% security cannot be assured.

`@clerk/localizations` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/localizations/LICENSE) for more information.
