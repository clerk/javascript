/**
 * Props shared by native components that can be embedded in the host app's own
 * navigation (`UserProfileView`, `AuthView`).
 */
export interface EmbeddedNavigationProps {
  /**
   * Shows a back button on the component's root screen that fires
   * {@link EmbeddedNavigationProps.onHostBack}.
   *
   * The component keeps its own navigation chrome, so screen titles, back
   * buttons, swipe-back, and transitions inside the component stay native.
   * Use this when the component fills a route whose own header is hidden.
   *
   * With expo-router, prefer the prewired screens from
   * `@clerk/expo/native/router` over wiring this manually.
   *
   * @default false
   */
  hostBackButton?: boolean;

  /**
   * Called when the user taps the root back button shown by
   * {@link EmbeddedNavigationProps.hostBackButton}. Pop the host route in response.
   */
  onHostBack?: () => void;
}
