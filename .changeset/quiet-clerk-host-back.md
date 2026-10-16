---
"@clerk/expo-native-components": patch
---

Allow the iOS host back button in embedded auth and profile views to dismiss its enclosing native navigation screen immediately. `onHostBack` now runs only when there is no screen to pop, such as when the view is the stack's root screen or is presented in a modal.
