---
'@clerk/ui': minor
---

Adds new `lightDark` theme.

This theme uses the `light-dark()` CSS function to automatically adapt colors based on the user's system color scheme preference, eliminating the need to manually switch between light and dark themes.

To enable it, within your project, you can do the following:

```tsx
import { lightDark } from '@clerk/ui/themes';
import { ClerkProvider } from '@clerk/nextjs';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider appearance={{ theme: lightDark }}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
```

and within your CSS file, add the following to enable automatic light/dark mode switching:

```css
:root {
  color-scheme: light dark;
}
```

This will automatically switch between light and dark modes based on the user's system preference. Alternatively, you can use a class-based approach:

```css
:root {
  color-scheme: light;
}

.dark {
  color-scheme: dark;
}
```

**Note:** The `light-dark()` CSS function requires modern browser support (Chrome 123+, Firefox 120+, Safari 17.4+). For older browsers, consider using the `dark` theme with manual switching.
