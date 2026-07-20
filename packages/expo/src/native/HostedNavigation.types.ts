/**
 * The embedded component's internal navigation state, reported through
 * `onNavigationChange` while `hideHeader` is enabled.
 */
export interface HostedNavigationState {
  /**
   * The number of screens pushed above the component's root screen.
   */
  depth: number;

  /**
   * Whether the component's internal stack has screens to pop.
   *
   * While `true`, route back actions (header back button, gestures, Android
   * hardware back) should call `goBack()` on the component ref instead of
   * popping the route.
   */
  canGoBack: boolean;
}

/**
 * Props shared by native components that support embedding inside the host
 * app's own navigation (`UserProfileView`, `AuthView`).
 */
export interface HostedNavigationProps {
  /**
   * Hides the component's built-in navigation header so it can be pushed onto
   * the host app's own navigation stack without a double header.
   *
   * The host owns all header chrome, including back affordances: render your
   * own back button and call `goBack()` on the component ref while
   * `onNavigationChange` reports `canGoBack: true`.
   *
   * With expo-router, prefer the prewired screens from
   * `@clerk/expo/native/router` over wiring this manually.
   *
   * @default false
   */
  hideHeader?: boolean;

  /**
   * Called when the component's internal navigation stack changes.
   *
   * Only fires while `hideHeader` is enabled.
   */
  onNavigationChange?: (state: HostedNavigationState) => void;
}

/**
 * Imperative handle exposed by native components that support embedding
 * inside the host app's own navigation.
 */
export interface HostedNavigationRef {
  /**
   * Pops one screen off the component's internal navigation stack.
   * No-op at the component's root.
   */
  goBack: () => Promise<void>;

  /**
   * Pops the component's internal navigation stack back to its root screen.
   */
  popToRoot: () => Promise<void>;
}
