# Clerk.js UI Package - Development Patterns Guide

> A comprehensive guide to the architectural patterns, conventions, and best practices used in the Clerk.js UI package. This document serves as context for development and maintains consistency across the codebase.

## Table of Contents

1. [Package Structure & Organization](#package-structure--organization)
2. [Localization & Internationalization](#localization--internationalization)
3. [Form Submission & Validation](#form-submission--validation)
4. [API Communication & Data Fetching](#api-communication--data-fetching)
5. [Component Architecture & Styling](#component-architecture--styling)
6. [Key Development Principles](#key-development-principles)

---

## Package Structure & Organization

### Directory Architecture

The Clerk.js UI package follows a layered architecture with 620+ TypeScript files organized in a hierarchical structure:

```
ui/
├── Components.tsx          # Main component orchestrator & lazy loading
├── foundations/           # Design system foundations (colors, typography, spacing)
├── primitives/           # Low-level components (Box, Button, Input)
├── elements/            # Mid-level composite components (Form, Modal, Card)
├── components/          # High-level feature components (SignIn, UserProfile)
├── customizables/       # Theme customization system
├── styledSystem/        # CSS-in-JS infrastructure
├── contexts/           # React Context providers
├── hooks/             # Custom hooks
├── router/            # Virtual routing system
├── utils/             # Utility functions
├── localization/      # i18n system
├── lazyModules/       # Code splitting components
└── icons/             # SVG icon assets
```

### Build Architecture

**Multiple Entry Points:**

- `clerk.browser.js` - Main browser bundle with chunking
- `clerk.headless.js` - Headless/server-side bundle
- `clerk.legacy.browser.js` - Legacy browser support with polyfills
- `clerk.mjs` - ES module bundle
- `clerk.no-rhc.js/mjs` - Extension-friendly bundle (no remote code)

**Intelligent Code Splitting:**

- Component-based chunks (signin, signup, userprofile, etc.)
- Vendor chunks (React, Stripe, Coinbase Wallet SDK)
- UI common chunk for shared utilities
- Framework chunk for React-specific code

---

## Localization & Internationalization

### Token-Based System

Clerk uses a sophisticated token replacement system with type-safe localization keys:

```typescript
// Key generation with parameters
localizationKeys('socialButtonsBlockButton', { provider: 'google' });
// Renders: "Continue with Google"

// Date formatting with modifiers
localizationKeys('dates.previous6Days', { date: new Date() });
// Renders: "Last Friday at 3:30 PM"
```

### Token Syntax Patterns

```typescript
// Global tokens (automatically available)
'Welcome to {{applicationName}}, {{user.firstName}}';

// Modifiers for formatting
'Continue with {{provider|titleize}}';
"Last active: {{date|timeString('en-US')}}";
"Join date: {{date|longDate('fr-FR')}}";
```

### Component Integration

```tsx
// Direct localization in components
<Text localizationKey={localizationKeys('backButton')} />

// With dynamic tokens
<Button
  localizationKey={localizationKeys('socialButtonsBlockButton', {
    provider: 'google'
  })}
/>

// HOC pattern for localizable components
export const Text = makeCustomizable(makeLocalizable(sanitizeDomProps(Primitives.Text)));
```

### Available Modifiers

- `titleize` - Capitalizes words
- `timeString` - Formats time ("10:00 PM", "22:00")
- `weekday` - Day names ("Friday", "vendredi")
- `numeric` - Date numbers ("12/31/2021", "31/12/2021")
- `shortDate` - Abbreviated dates ("Dec 31")
- `longDate` - Full dates ("December 31, 2021")
- `link` - Creates markdown links for legal text

---

## Form Submission & Validation

### Form Architecture

Clerk uses a declarative form system with state management and validation:

```tsx
// Form state pattern
const formState = {
  emailAddress: useFormControl('emailAddress', '', {
    type: 'email',
    label: localizationKeys('formFieldLabel__emailAddress'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
  }),
  password: useFormControl('password', '', {
    type: 'password',
    validatePassword: true,
    buildErrorMessage: errors => createPasswordError(errors, { t, locale, passwordSettings }),
  }),
};
```

### Validation Patterns

**Client-Side Validation:**

```typescript
// Built-in transformers
const emailTransformer = (v: string) => v.trim();

// Custom validation with error building
buildErrorMessage: errors => createPasswordError(errors, { t, locale, passwordSettings });
```

**Server-Side Error Handling:**

```typescript
// Centralized error handling
handleError(err, fieldStates, setGlobalError);

// Field-specific error mapping
const errorsArray = errors.filter(
  err => err.meta?.paramName === field.id || snakeToCamel(err.meta?.paramName) === field.id,
);
```

### Submission Flow

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Multi-level loading states
  card.setLoading();
  card.setError(undefined);

  return signUp
    .create(buildRequest(fieldsToSubmit))
    .then(res => completeSignUpFlow({ signUp: res /* ... */ }))
    .catch(err => handleError(err, fieldsToSubmit, card.setError))
    .finally(() => card.setIdle());
};
```

### Field State Management

```typescript
export interface FieldState<T> {
  name: string;
  value: T;
  setValue: React.Dispatch<React.SetStateAction<T>>;
  error: string | undefined;
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  clearFeedback: () => void;
  setSuccess: (message: string) => void;
  setWarning: (message: string) => void;
}
```

---

## API Communication & Data Fetching

### Centralized HTTP Client

All API communication goes through a unified `fapiClient`:

```typescript
// Core client features
- Method normalization (GET/POST only for Safari CORS)
- Session ID injection for authentication
- Retry mechanism with exponential backoff
- Request/response interceptors
- URL building with query parameters
```

### Data Fetching Patterns

**Custom useFetch Hook (SWR Alternative):**

```typescript
export const useFetch = <K, T>(
  fetcher: ((...args: any) => Promise<T>) | undefined,
  params: K,
  options?: {
    staleTime?: number; // Default: 2 minutes
    throttleTime?: number;
    onSuccess?: (data: T) => void;
  },
) => {
  // Global cache with subscriber pattern
  // Stale-while-revalidate strategy
  // Automatic revalidation on focus
};
```

**SWR Integration for Advanced Cases:**

```typescript
const {
  data: apiKeys,
  isLoading,
  mutate,
} = useSWR({ key: 'api-keys', subject }, () => clerk.apiKeys.getAll({ subject }));
```

### Caching Strategy

**Multi-Level Caching:**

1. **Request Cache** - Global Map-based cache for API responses
2. **Token Cache** - JWT token caching with automatic expiration
3. **Component Cache** - Per-component state management

```typescript
// Token cache with automatic cleanup
const get = (cacheKeyJSON, leeway = 10) => {
  const expiresSoon = value.expiresIn! - elapsedSeconds < leeway + SYNC_LEEWAY;
  if (expiresSoon) {
    cache.delete(cacheKey.toKey());
    return;
  }
  return value.entry;
};
```

### Error Handling Patterns

```typescript
// Network error classification
if (status >= 400) {
  if (status === 401 && code !== 'requires_captcha') {
    await BaseResource.clerk.handleUnauthenticated();
  }

  if (status === 429 && headers) {
    const retryAfter = headers.get('retry-after');
    apiResponseOptions.retryAfter = parseInt(retryAfter, 10);
  }

  throw new ClerkAPIResponseError(message, apiResponseOptions);
}
```

### Real-time Updates

```typescript
// Session polling (5-second intervals)
public startPollingForSessionToken(cb: () => Promise<unknown>): void {
  const run = async () => {
    await this.lock.acquireLockAndRun(cb); // Prevents concurrent updates
    this.timerId = this.workerTimers.setTimeout(run, 5000);
  };
  void run();
}

// Focus-based revalidation
window.addEventListener('focus', async () => {
  if (Date.now() < lastTouchTimestamp.current + THROTTLE_DURATION_MS) return;
  const { authConfig: { claimedAt } } = await environment.fetch();
  if (claimedAt !== null) forceUpdate();
});
```

---

## Component Architecture & Styling

### Layered Component System

**Foundation Layer:**

- Design tokens (colors, typography, spacing, shadows)
- CSS variables and theme system
- Breakpoint definitions

**Primitive Layer:**

- Basic components (Box, Button, Input, Text)
- Variant-based styling system
- Low-level behavior patterns

**Element Layer:**

- Composite components (Form, Modal, Card, Menu)
- Complex interaction patterns
- Layout compositions

**Component Layer:**

- Feature-complete components (SignIn, UserProfile, OrganizationSwitcher)
- Business logic integration
- Complete user flows

### CSS-in-JS with Emotion

```tsx
// Variant system pattern
const { applyVariants, filterProps } = createVariants((theme, props) => ({
  base: {
    boxSizing: 'border-box',
    borderRadius: theme.radii.$md,
    transitionProperty: theme.transitionProperty.$common,
  },
  variants: {
    size: {
      sm: { padding: `${theme.space.$1x5} ${theme.space.$3}` },
      md: { padding: `${theme.space.$2x5} ${theme.space.$5}` },
    },
    colorScheme: {
      primary: {
        [vars.accent]: theme.colors.$primary500,
        [vars.accentHover]: theme.colors.$primaryHover,
      },
    },
  },
  defaultVariants: { size: 'sm', colorScheme: 'primary' },
}));
```

### Customization System

**Element Descriptors:**

```tsx
// Class-based customization hooks
export const descriptors = {
  button: createDescriptor('button'),
  cardBox: createDescriptor('cardBox'),
  socialButtons: createDescriptor('socialButtons'),
  // 200+ descriptors for granular control
};

// Customizable HOC
export const makeCustomizable = (Component, options) => {
  return React.forwardRef((props, ref) => {
    const { elementDescriptor, elementId, sx, className, ...restProps } = props;
    const { parsedElements } = useAppearance();

    const generatedStyles = generateClassName(parsedElements, descriptors, elementId);

    return (
      <Component
        css={generatedStyles.css}
        className={generatedClassname}
        {...restProps}
        ref={ref}
      />
    );
  });
};
```

### Responsive Design Patterns

```tsx
// Mobile-first breakpoints
const breakpoints = {
  xs: '21em', // 336px
  sm: '30em', // 480px
  md: '48em', // 768px
  lg: '62em', // 992px
  xl: '80em', // 1280px
};

// Usage in styles
const cardStyles = t => ({
  margin: `${t.space.$16} 0`,
  [mqu.sm]: {
    margin: `${t.space.$10} 0`,
  },
});
```

### Animation System

```tsx
// Keyframe library
const animations = {
  spinning: keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  `,
  modalSlideAndFade: keyframes`
    0% { opacity: 0; transform: translateY(0.5rem); }
    100% { opacity: 1; transform: translateY(0); }
  `,
  expandIn: max => keyframes`
    0% { opacity: 0; max-height: 0; }
    100% { opacity: 1; max-height: ${max}; }
  `,
};

// Auto-animate integration
export const Animated = ({ children, asChild }) => {
  const { animations: enabled } = useAppearance().parsedLayout;
  const [parent] = useAutoAnimate();

  if (asChild) {
    return cloneElement(children, { ref: enabled ? parent : null });
  }

  return <div ref={enabled ? parent : null}>{children}</div>;
};
```

### Accessibility Patterns

```tsx
// Modal accessibility
<Flex
  ref={floating}
  aria-modal='true'
  role='dialog'
  sx={modalStyles}
>
  {children}
</Flex>;

// Form field pattern
const FormField = ({ label, required, error, ...props }) => {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;

  return (
    <Field>
      <Label
        htmlFor={fieldId}
        required={required}
      >
        {label}
      </Label>
      <Input
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        aria-required={required}
        {...props}
      />
      {error && (
        <ErrorText
          id={errorId}
          role='alert'
        >
          {error}
        </ErrorText>
      )}
    </Field>
  );
};
```

### Compound Component Pattern

```tsx
// Composition pattern
export const Card = {
  Root: CardRoot,
  Content: CardContent,
  Footer: CardFooter,
  Alert: CardAlert,
  Action: CardAction,
};

// Usage
<Card.Root>
  <Card.Content>
    <Card.Alert />
    Content here
  </Card.Content>
  <Card.Footer>
    <Card.Action />
  </Card.Footer>
</Card.Root>;
```

---

## Key Development Principles

### 1. Type Safety First

- Full TypeScript implementation with advanced type patterns
- Compile-time validation of localization keys
- ICU argument type checking for i18n
- Prevents runtime errors through strong typing

### 2. Performance Optimization

- Extensive lazy loading and code splitting
- Component preloading with hints
- Memoized contexts and expensive computations
- Optimized rendering with React 18 features

### 3. Accessibility by Default

- ARIA support throughout all components
- Keyboard navigation patterns
- Screen reader optimization
- Color contrast and focus management

### 4. Customization Without Conflicts

- Element descriptor system for granular control
- CSS-in-JS prevents style conflicts
- Theme cascade with multiple levels
- Runtime appearance parsing

### 5. Error Recovery and Resilience

- Comprehensive error classification and handling
- Graceful degradation for offline scenarios
- Retry mechanisms with exponential backoff
- User-friendly error messages with localization

### 6. Mobile-First Responsive Design

- Mobile-first breakpoint system
- iOS-specific optimizations
- Touch-friendly interactions
- Responsive image optimization

### 7. Developer Experience

- Clear component hierarchies and patterns
- Consistent API across all components
- Extensive TypeScript support
- Hot reloading and development tools

### 8. Production Readiness

- Error boundaries and fallback UI
- Loading states and skeleton screens
- Bundle size optimization
- Security best practices (no secret exposure)

### 9. Testability

- Dependency injection patterns
- Mock-friendly architecture
- Clear separation of concerns
- Pure function utilities

### 10. Internationalization Support

- 30+ language support with fallbacks
- Cultural considerations (RTL, date formats)
- Locale-specific formatting
- Dynamic token replacement

---

This patterns guide serves as the foundation for consistent development within the Clerk.js UI package. Following these patterns ensures maintainability, performance, and excellent user experience across all components and features.
