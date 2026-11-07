/**
 * Props shared by native components that can be embedded in the host app's own
 * navigation (`UserProfileView`, `AuthView`).
 */
export interface EmbeddedNavigationProps {
  /**
   * Shows a back button on the component's root screen. On iOS, tapping it pops
   * the native navigation screen that contains the component, and this callback
   * runs only when there is no such screen to pop, such as when the component is
   * the stack's root screen or is presented in a modal. On Android, tapping it
   * always calls this. Pop your own route or dismiss your modal in response.
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
