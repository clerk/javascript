---
'@clerk/ui': major
---

Changes provider icon rendering from `<Image>` to `<Span>` elements to support customizable icon fills via CSS variables.

Provider icons for Apple, GitHub, OKX Wallet, and Vercel now use CSS `mask-image` technique with a customizable `--cl-icon-fill` CSS variable, allowing themes to control icon colors. Other provider icons (like Google) continue to render as full-color images using `background-image`.

You can customize the icon fill color in your theme:

```tsx
import { createTheme } from '@clerk/ui/themes';

const myTheme = createTheme({
  name: 'myTheme',
  elements: {
    providerIcon__apple: {
      '--cl-icon-fill': '#000000', // Custom fill color
    },
    providerIcon__github: {
      '--cl-icon-fill': 'light-dark(#000000, #ffffff)', // Theme-aware fill
    },
  },
});
```

This change enables better theme customization for monochrome provider icons while maintaining full-color support for providers that require it.
