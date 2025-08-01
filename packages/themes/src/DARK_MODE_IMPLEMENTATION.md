# Dark Mode Implementation Summary

## Overview

This implementation adds dark mode support to the `createTheme` utility, allowing developers to define both light and dark color values using tuple syntax `[light, dark]`.

## Key Features

### 1. Tuple Color Support

- Use `[lightValue, darkValue]` syntax for any color variable
- Single values continue to work as before
- Only tuple values generate CSS variables globally

### 2. Dynamic Selector Support

- Supports CSS class selectors: `.dark`
- Supports attribute selectors: `[data-theme="dark"]`
- Supports media queries: `@media (prefers-color-scheme: dark)`

### 3. Automatic CSS Variable Generation

- Tuple values automatically generate `--clerk-*` CSS variables
- Media queries wrap variables in `:root {}` within the media query
- Class/attribute selectors apply variables directly to the selector

## Usage Examples

### Basic Usage

```typescript
import { createTheme } from '@clerk/themes';

const customTheme = createTheme(darkModeSelector => ({
  variables: {
    colorPrimary: ['#007bff', '#0d6efd'], // [light, dark]
    colorBackground: ['#ffffff', '#1a1a1a'],
    borderRadius: '8px', // Single values work as before
  },
  elements: {
    button__primary: {
      backgroundColor: 'red',
      [darkModeSelector]: {
        backgroundColor: 'blue',
      },
    },
  },
}));
```

### With Class Selector

```typescript
<ClerkProvider
  appearance={{
    theme: customTheme({ darkSelector: '.dark' })
  }}
>
  <App />
</ClerkProvider>
```

### With Media Query

```typescript
<ClerkProvider
  appearance={{
    theme: customTheme({ darkSelector: '@media (prefers-color-scheme: dark)' })
  }}
>
  <App />
</ClerkProvider>
```

## Generated CSS

### For Class Selector (`.dark`)

```css
:root {
  --clerk-color-primary: #007bff;
  --clerk-color-background: #ffffff;
}

.dark {
  --clerk-color-primary: #0d6efd;
  --clerk-color-background: #1a1a1a;
}
```

### For Media Query

```css
:root {
  --clerk-color-primary: #007bff;
  --clerk-color-background: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --clerk-color-primary: #0d6efd;
    --clerk-color-background: #1a1a1a;
  }
}
```

## Built-in Themes

The `clerk` theme now supports dark mode out of the box:

```typescript
import { clerk } from '@clerk/themes';

<ClerkProvider
  appearance={{
    theme: clerk({ darkSelector: '.dark' })
  }}
>
  <App />
</ClerkProvider>
```

## Implementation Details

### Files Modified

- `packages/types/src/appearance.ts` - Added internal theme properties
- `packages/themes/src/createTheme.ts` - Enhanced createTheme function
- `packages/clerk-js/src/ui/customizables/generateDarkModeStyles.ts` - CSS generation logic
- `packages/clerk-js/src/ui/customizables/AppearanceContext.tsx` - Injection of global styles
- `packages/clerk-js/src/ui/customizables/parseVariables.ts` - Tuple value processing
- `packages/themes/src/themes/clerk.ts` - Dark mode support for default theme

### Key Principles

1. **Backwards Compatible** - Single values continue to work exactly as before
2. **Opt-in** - Dark mode features only activate when using tuple values
3. **Flexible** - Supports multiple selector strategies
4. **Automatic** - CSS variables are generated and injected automatically

## Testing

The sandbox application demonstrates the functionality with the built-in `clerk` theme using `@media (prefers-color-scheme: dark)` as the selector.
