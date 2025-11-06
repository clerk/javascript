import type { AuthContextValue } from '../contexts/AuthContext';

type AuthSnapshot = AuthContextValue;
type Listener = () => void;

class AuthStore {
  private listeners = new Set<Listener>();
  private currentSnapshot: AuthSnapshot | null = null;
  private initialServerSnapshot: AuthSnapshot | null = null;
  private isHydrated = false;

  getClientSnapshot = (): AuthSnapshot => {
    console.log('[authStore] getClientSnapshot ->', { userId: this.currentSnapshot?.userId });
    return this.currentSnapshot || this.getEmptySnapshot();
  };

  getServerSnapshot = (): AuthSnapshot => {
    const useServerSnapshot = !this.isHydrated && this.initialServerSnapshot;
    console.log('[authStore] getServerSnapshot ->', {
      isHydrated: this.isHydrated,
      useServerSnapshot,
      userId: useServerSnapshot ? this.initialServerSnapshot?.userId : this.currentSnapshot?.userId,
    });
    if (useServerSnapshot) {
      return this.initialServerSnapshot;
    }
    return this.currentSnapshot || this.getEmptySnapshot();
  };

  setInitialServerSnapshot(snapshot: AuthSnapshot): void {
    console.log('[authStore] setInitialServerSnapshot', { userId: snapshot.userId });
    this.initialServerSnapshot = snapshot;
  }

  setSnapshot(snapshot: AuthSnapshot): void {
    console.log('[authStore] setSnapshot', { userId: snapshot.userId, listeners: this.listeners.size });
    this.currentSnapshot = snapshot;
    this.notifyListeners();
  }

  subscribe = (listener: Listener): (() => void) => {
    console.log('[authStore] subscribe', { total: this.listeners.size + 1 });
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  markHydrated(): void {
    console.log('[authStore] markHydrated - now using client snapshots');
    this.isHydrated = true;
  }

  private getEmptySnapshot(): AuthSnapshot {
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

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

export const authStore = new AuthStore();
