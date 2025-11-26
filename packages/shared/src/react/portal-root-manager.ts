/**
 * PortalRootManager manages a stack of portal root containers.
 * This allows PortalProvider to work across separate React trees
 * (e.g., when Clerk modals are rendered in a different tree via Components.tsx).
 */
class PortalRootManager {
  private stack: Array<() => HTMLElement | null> = [];

  /**
   * Push a new portal root getter onto the stack.
   * @param getContainer Function that returns the container element
   */
  push(getContainer: () => HTMLElement | null): void {
    this.stack.push(getContainer);
  }

  /**
   * Pop the most recent portal root from the stack.
   */
  pop(): void {
    this.stack.pop();
  }

  /**
   * Get the current (topmost) portal root container.
   * @returns The container element or null if no provider is active
   */
  getCurrent(): HTMLElement | null {
    if (this.stack.length === 0) {
      return null;
    }
    const getContainer = this.stack[this.stack.length - 1];
    return getContainer();
  }
}

export const portalRootManager = new PortalRootManager();
