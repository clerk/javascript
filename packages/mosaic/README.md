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

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
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

`@clerk/mosaic` is Clerk's experimental next-generation React components.

This package lets us build and iterate on our next component refresh in public, feel free to try them out and provide feedback. If you do, know that we reserve the right to make breaking changes in minors and pin your version.

When stable, components will move to be exported through the regular packages.

### Prerequisites

- Node.js `>=20.9.0` or later
- A Clerk SDK that renders a `ClerkProvider` (`@clerk/react`, `@clerk/nextjs`, …)
- React 18 or 19

### Installation

```shell
npm install @clerk/mosaic
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

To keep theme CSS ahead of Mosaic's sheet, import the stylesheet into a cascade layer:

```css
@import '@clerk/mosaic/styles.css' layer(components);
```

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/mosaic/LICENSE) for more information.
