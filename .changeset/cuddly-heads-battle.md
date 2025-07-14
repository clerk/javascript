---
'@clerk/clerk-js': minor
'@clerk/themes': minor
'@clerk/types': minor
---

Expose Clerk CSS variables as an option for theming Clerk's components. This change introduces CSS custom properties that allow developers to customize Clerk's appearance using standard CSS variables, providing a more flexible theming approach.


```css
:root {
  --clerk-color-primary: #6D47FF;
  --clerk-color-primary-foreground: #FFFFFF;
}
```

## Deprecated variables


| Deprecated | New |
|--------|--------|
| `colorText` | `colorForeground` |
| `colorTextOnPrimaryBackground` | `colorPrimaryForeground` |
| `colorTextSecondary` | `colorMutedForeground` |
| `spacingUnit` | `spacing` |
| `colorInputText` | `colorInputForeground` |
| `colorInputBackground` | `colorInput` |

Deprecated variables will continue to work but will be removed in the next major version.

## New variables

- `colorRing` - The color of the ring when an interactive element is focused.
- `colorMuted` - The background color for elements of lower importance, eg: a muted background.
- `colorShadow` - The base shadow color used in the components.
- `colorBorder` - The base border color used in the components.