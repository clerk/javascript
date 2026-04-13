---
'@clerk/expo': minor
---

Add native component theming via the Expo config plugin. You can now customize the appearance of Clerk's native components (`<AuthView />`, `<UserButton />`, `<UserProfileView />`) on iOS and Android by passing a `theme` prop to the plugin pointing at a JSON file:

```json
{
  "expo": {
    "plugins": [
      ["@clerk/expo", { "theme": "./clerk-theme.json" }]
    ]
  }
}
```

The JSON theme supports:

- `colors` — 15 semantic color tokens (`primary`, `background`, `input`, `danger`, `success`, `warning`, `foreground`, `mutedForeground`, `primaryForeground`, `inputForeground`, `neutral`, `border`, `ring`, `muted`, `shadow`) as 6- or 8-digit hex strings.
- `darkColors` — same shape as `colors`; applied automatically when the system is in dark mode.
- `design.borderRadius` — number, applied to both platforms.
- `design.fontFamily` — string, **iOS only**.

Theme JSON is validated at prebuild. On iOS the theme is embedded into `Info.plist`; on Android the JSON is copied into `android/app/src/main/assets/clerk_theme.json`. The plugin does not modify your app's `userInterfaceStyle` setting — control light/dark mode via `"userInterfaceStyle"` in `app.json`.
