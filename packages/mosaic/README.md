<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_mosaic" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/mosaic</h1>
</p>

<div align="center">

[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_mosaic)
[![Follow on X](https://img.shields.io/twitter/follow/clerk?style=social)](https://x.com/intent/follow?screen_name=clerk)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/mosaic/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_mosaic)

</div>

## Getting started

`@clerk/mosaic` provides Clerk's experimental next-generation React components.

This package lets you preview and provide feedback on Clerk's next generation of components.

When stable, components will move to be exported through the regular packages.

> :construction: We reserve the right to make breaking changes in minors, please pin your version.

### Prerequisites

- Node.js `>=20.9.0` or later
- A supported React-based Clerk SDK that renders a `ClerkProvider`
  - `@clerk/react` version 6 or later
  - `@clerk/nextjs` version 7 or later
  - Other React-based Clerk SDKs may also work, but are currently untested
- React 18 or 19

### Installation

```shell

npm install --save-exact @clerk/mosaic
pnpm add --save-exact @clerk/mosaic
yarn add --exact @clerk/mosaic
```

## Usage

Import the stylesheet and render Mosaic components beneath the SDK `ClerkProvider`:

```tsx
import { ClerkProvider } from '@clerk/react';
import { UserButton } from '@clerk/mosaic';
import '@clerk/mosaic/styles.css';

export function App({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.CLERK_PUBLISHABLE_KEY}>
      <UserButton />
      {children}
    </ClerkProvider>
  );
}
```

If you want to use custom CSS to theme the components, instead import the stylesheet into a cascade layer:

```css
@import '@clerk/mosaic/styles.css' layer(components);
```

This ensures your unlayered custom CSS takes priority. Expect more documentation on custom theming soon.

## Troubleshooting

### A Clerk hook says it can only be used within `<ClerkProvider />`

Mosaic and your Clerk framework SDK must resolve the same copy of `@clerk/shared`. If `<ClerkProvider />` is present but you still see this error, deduplicate your dependencies:

```shell
npm dedupe
pnpm dedupe
yarn dedupe @clerk/shared
```

Check the installed versions:

```shell
npm ls @clerk/shared
pnpm why @clerk/shared
yarn why @clerk/shared
```

If multiple versions remain, the supported ranges are likely incompatible. Update Mosaic and your Clerk framework SDK to the latest versions, then deduplicate again.

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/mosaic/LICENSE) for more information.
