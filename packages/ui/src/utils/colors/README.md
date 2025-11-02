# Colors System

This folder contains the color manipulation utilities for Clerk's UI components. The system automatically chooses between **legacy** and **modern** color handling based on browser support.

## How It Works

The color system uses a **progressive enhancement** approach:

1. **Detect browser capabilities** - Check if the browser supports modern CSS color features
2. **Choose the right approach** - Use modern CSS when available, fall back to legacy methods
3. **Provide consistent API** - Same functions work regardless of which approach is used

## Legacy vs Modern Approach

### Legacy Color Handling (`legacy.ts`)

- **When**: Used in older browsers that don't support modern CSS color features
- **How**: Converts colors to HSLA objects and manipulates values in JavaScript
- **Example**: `#ff0000` becomes `{ h: 0, s: 100, l: 50, a: 1 }`
- **Output**: Returns HSLA strings like `hsla(0, 100%, 50%, 1)`

### Modern Color Handling (`modern.ts`)

- **When**: Used in browsers that support `color-mix()` or relative color syntax
- **How**: Uses native CSS color functions in order to support CSS variables
- **Example**: `color-mix(in srgb, #ff0000 80%, white 20%)` for lightening
- **Output**: Returns modern CSS color strings

## Key Features

- **Automatic detection** - No need to manually choose legacy vs modern
- **Same API** - All functions work the same way regardless of browser
- **Fallback support** - Always works, even in older browsers

## Main Functions

```typescript
// Lighten a color by percentage
colors.lighten('#ff0000', 20); // Makes red 20% lighter

// Make a color transparent
colors.makeTransparent('#ff0000', 50); // Makes red 50% transparent

// Set specific opacity
colors.setAlpha('#ff0000', 0.5); // Sets red to 50% opacity

// Adjust for better contrast
colors.adjustForLightness('#333333', 10); // Slightly lightens dark colors
```

## Browser Support Detection

The system checks for these modern CSS features:

- `color-mix()` function
- Relative color syntax (`hsl(from white h s l)`)

If either is supported, modern handling is used. Otherwise, legacy handling kicks in.
