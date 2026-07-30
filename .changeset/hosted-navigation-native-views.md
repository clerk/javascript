---
'@clerk/expo': minor
---

Support pushing the native `UserProfileView` and `AuthView` onto your app's own navigation stack.

New optional `onHostBack` prop shows a back button on the component's root screen and calls you when it is tapped. The component keeps its own navigation chrome, so screen titles, back buttons, swipe-back, and transitions inside the component stay native — hide your route's header and pop your route from the callback:

```tsx
<Stack.Screen options={{ headerShown: false }} />
<UserProfileView isDismissible={false} onHostBack={() => router.back()} />
```

The component never leaves the route on its own, so react to auth state for flow completion — either swap the content in place or pop the route.

Existing usage is unaffected: the prop is optional, and the components render exactly as before without it. Requires the corresponding clerk-ios and clerk-android SDK releases.
