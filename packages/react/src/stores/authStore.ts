import type { AuthContextValue } from '../contexts/AuthContext';
import type { IsomorphicClerk } from '../isomorphicClerk';

type AuthSnapshot = AuthContextValue;
type Listener = () => void;

class AuthStore {
  private listeners = new Set<() => void>();
  private currentSnapshot: AuthSnapshot;
  private serverSnapshot: AuthSnapshot | null = null;
  private clerkUnsubscribe: (() => void) | null = null;

  constructor() {
    this.currentSnapshot = this.createEmptySnapshot();
  }

  /**
   * Connect to Clerk and sync state
   */
  connectToClerk(clerk: IsomorphicClerk) {
    this.disconnect();

    this.clerkUnsubscribe = clerk.addListener(() => {
      this.updateFromClerk(clerk);
    });

    this.updateFromClerk(clerk);
  }

  disconnect() {
    if (this.clerkUnsubscribe) {
      this.clerkUnsubscribe();
      this.clerkUnsubscribe = null;
    }
  }

  /**
   * Set the SSR snapshot - must be called before hydration
   */
  setServerSnapshot(snapshot: AuthSnapshot) {
    this.serverSnapshot = snapshot;
  }

  /**
   * For useSyncExternalStore - returns current client state
   */
  getSnapshot = (): AuthSnapshot => {
    return this.currentSnapshot;
  };

  /**
   * For useSyncExternalStore - returns SSR/hydration state
   * React automatically uses this during SSR and hydration
   */
  getServerSnapshot = (): AuthSnapshot => {
    // If we have a server snapshot, ALWAYS return it
    // React will switch to getSnapshot after hydration
    return this.serverSnapshot || this.currentSnapshot;
  };

  /**
   * Subscribe to changes
   */
  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /**
   * Update state from Clerk
   */
  private updateFromClerk(clerk: IsomorphicClerk) {
    const newSnapshot = this.transformClerkState(clerk);

    // Only notify if actually changed (reference equality is fine here)
    if (newSnapshot !== this.currentSnapshot) {
      this.currentSnapshot = newSnapshot;
      this.notifyListeners();
    }
  }

  private transformClerkState(clerk: IsomorphicClerk): AuthSnapshot {
    // Transform Clerk's state to AuthSnapshot format
    return {
      userId: clerk.user?.id,
      sessionId: clerk.session?.id,
      sessionStatus: clerk.session?.status,
      sessionClaims: clerk.session?.claims,
      orgId: clerk.organization?.id,
      orgSlug: clerk.organization?.slug,
      orgRole: clerk.organization?.role,
      orgPermissions: clerk.organization?.permissions,
      actor: clerk.session?.actor,
      factorVerificationAge: clerk.session?.factorVerificationAge ?? null,
    };
  }

  private createEmptySnapshot(): AuthSnapshot {
    return {
      actor: undefined,
      factorVerificationAge: null,
      orgId: undefined,
      orgPermissions: undefined,
      orgRole: undefined,
      orgSlug: undefined,
      sessionClaims: undefined,
      sessionId: undefined,
      sessionStatus: undefined,
      userId: undefined,
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const authStore = new AuthStore();
