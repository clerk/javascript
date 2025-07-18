# @clerk/storybook

This package provides Storybook documentation for Clerk components using the React component library.

## Why a Separate Package?

This approach offers several advantages over integrating Storybook directly into the `clerk-js` package:

1. **Clean Architecture**: Dedicated package for documentation with its own build setup
2. **React Components**: Uses `@clerk/clerk-react` components directly instead of wrapping vanilla JS
3. **Better TypeScript Support**: Proper typing and intellisense for React components
4. **Standard Patterns**: Follows conventional Storybook patterns for component documentation
5. **Easier Maintenance**: Isolated configuration and dependencies

## Components Documented

- **Authentication**: `SignIn`, `SignUp`, `SignInButton`, `SignUpButton`
- **User Management**: `UserButton`, `UserProfile`
- **Organization Management**: `OrganizationSwitcher`, `OrganizationProfile`, `CreateOrganization`, `OrganizationList`
- **Specialized**: `GoogleOneTap`, `Waitlist`, `PricingTable`, `APIKeys`
- **Control Components**: `SignedIn`, `SignedOut`, `Protect`, etc.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start Storybook
pnpm dev

# Build Storybook
pnpm build
```

## Features

- **Appearance Controls**: Interactive controls for theming and customization
- **Localization**: Support for multiple languages via toolbar
- **Auto-generated Documentation**: Using Storybook's autodocs feature
- **Interactive Examples**: Live component examples with controls
- **TypeScript Support**: Full TypeScript support with proper types

## Development

Stories are located in the `stories/` directory. Each component has its own story file with multiple variants demonstrating different use cases and configurations.

The Storybook configuration includes:

- Global appearance and localization controls
- Auto-generated documentation
- Interactive controls for component props
- Proper ClerkProvider context for all stories
