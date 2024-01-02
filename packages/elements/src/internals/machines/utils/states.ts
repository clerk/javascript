/**
 * A helper to navigate to a child state.
 * Returns a string that represents the state to go to.
 */
export function goToChildState(stateOrChild: string, child?: string): string {
  return child ? `${stateOrChild}.${child}` : `.${stateOrChild}`;
}
