---
name: clerk-mosaic
description: Install @clerk/mosaic, Clerk's composable UI components, into a React or Next.js app that already uses Clerk. Use when asked to add Mosaic, or to add a Mosaic UserButton, UserProfile, OrganizationSwitcher or OrganizationProfile.
---

# Add Clerk Mosaic to this app

Mosaic is Clerk's composable UI kit, published as `@clerk/mosaic`. Its components read from the app's existing Clerk session.

## Requirements

Check these before installing. If one is missing, stop and tell the user what to change.

- Node.js 20.9 or later
- React 18 or 19
- `@clerk/react` 6 or later, or `@clerk/nextjs` 7 or later
- A `ClerkProvider` rendered at the root of the app

If the app doesn't use Clerk yet, set up Clerk first by following https://clerk.com/SKILL.md, then come back.

## 1. Install the package

Mosaic is experimental, so pin an exact version. Use the package manager the project already uses:

```sh
pnpm add --save-exact @clerk/mosaic
npm install --save-exact @clerk/mosaic
yarn add --exact @clerk/mosaic
```

## 2. Import the styles

Import the stylesheet once, at the root of the app. In Next.js App Router, that's the root `layout.tsx`.

```ts
import '@clerk/mosaic/styles.css';
```

If the app themes components with its own CSS, import the stylesheet into a cascade layer instead, so the app's unlayered CSS wins:

```css
@import '@clerk/mosaic/styles.css' layer(components);
```

## 3. Render a component

Render Mosaic components beneath the `ClerkProvider`. Start with the `UserButton`, where the app shows the signed-in user, such as a header.

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

If the app already renders a `UserButton` from `@clerk/react` or `@clerk/nextjs`, replace that import with the one from `@clerk/mosaic`.

## Components

`@clerk/mosaic` exports:

- `UserButton`
- `UserAvatar`
- `UserProfile`
- `OrganizationSwitcher`
- `OrganizationProfile`

## Verify

Start the dev server, sign in, and confirm the `UserButton` renders and opens its menu. Report what you changed and anything you skipped.
