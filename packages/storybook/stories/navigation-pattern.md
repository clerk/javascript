# Storybook Navigation Pattern

This document explains how to implement navigation between stories in Storybook, specifically addressing the iframe reload issue when using authentication components like Clerk's SignIn.

## The Problem

When using `forceRedirectUrl` or `afterSignInUrl` with authentication components in Storybook, the redirect happens within the iframe context, causing:

- Nested iframe reloads
- Poor user experience
- Broken navigation flow

## The Solution

Use React state management combined with Storybook's `@storybook/addon-links` to handle navigation:

### 1. Install Dependencies

```bash
pnpm add -D @storybook/addon-links
```

### 2. Configure Storybook

In `.storybook/main.ts`:

```typescript
export default {
  addons: ['@storybook/addon-links'],
  // ... other config
};
```

### 3. Implementation Pattern

```typescript
import React from 'react';
import { SignIn, useUser } from '@clerk/clerk-react';
import { linkTo } from '@storybook/addon-links';

export const WithNavigation: Story = {
  render: (args) => {
    const { isSignedIn } = useUser();

    // Navigate when user becomes signed in
    React.useEffect(() => {
      if (isSignedIn) {
        const timer = setTimeout(() => {
          linkTo('Components/UserProfile', 'WithNavigation')();
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [isSignedIn]);

    // Override redirect URLs to prevent iframe issues
    const modifiedArgs = {
      ...args,
      afterSignInUrl: undefined,
      forceRedirectUrl: undefined,
    };

    return <SignIn {...modifiedArgs} />;
  },
};
```

### 4. Bidirectional Navigation

Create corresponding navigation in the target story:

```typescript
export const WithNavigation: Story = {
  render: (args) => {
    const { isSignedIn } = useUser();

    if (!isSignedIn) {
      return (
        <div>
          <h3>Please sign in to view your profile</h3>
          <button onClick={linkTo('Components/SignIn', 'WithNavigation')}>
            Go to Sign In
          </button>
        </div>
      );
    }

    return <UserProfile {...args} />;
  },
};
```

## Key Benefits

- **No iframe reload issues**: Navigation happens within Storybook's navigation system
- **Smooth user experience**: Seamless transitions between stories
- **Maintains context**: Storybook's iframe context is preserved
- **Works with authentication**: Compatible with Clerk and other auth providers

## Use Cases

This pattern is useful for:

- Authentication flows (Sign In → Profile)
- Multi-step forms
- Wizard-like components
- Any scenario requiring story-to-story navigation

## Examples

See the following stories for working examples:

- `Components/SignIn` → `WithNavigation` and `NavigationDemo`
- `Components/UserProfile` → `WithNavigation`
