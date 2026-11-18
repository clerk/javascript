/**
 * Props shared by native components that can be embedded in the host app's own
 * navigation (`UserProfileView`, `AuthView`).
 */
export interface EmbeddedNavigationProps {
  /**
   * Shows a back button on the component's root screen and calls this when it
   * is tapped. Pop your own route in response.
   *
   * The component keeps its own navigation chrome, so screen titles, back
   * buttons, swipe-back, and transitions inside the component stay native.
   * Use this when the component fills a route whose own header is hidden:
   *
   * ```tsx
   * <Stack.Screen options={{ headerShown: false }} />
   * <UserProfileView isDismissible={false} onHostBack={() => router.back()} />
   * ```
   *
   * The component never leaves the route on its own, so react to auth state
   * for flow completion — swap the content in place, or pop the route.
   */
  onHostBack?: () => void;
}
