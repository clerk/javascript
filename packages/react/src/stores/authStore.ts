import type { AuthContextValue } from '../contexts/AuthContext';

type AuthSnapshot = AuthContextValue;
type Listener = () => void;

class AuthStore {
  private listeners = new Set<Listener>();
  private currentSnapshot: AuthSnapshot | null = null;
  private initialServerSnapshot: AuthSnapshot | null = null;
  private isHydrated = false;
  private cachedEmptySnapshot: AuthSnapshot;
  private cachedServerSnapshot: AuthSnapshot | null = null;

  constructor() {
    this.cachedEmptySnapshot = this.getEmptySnapshot();
  }

  getClientSnapshot = (): AuthSnapshot => {
    return this.currentSnapshot || this.cachedEmptySnapshot;
  };

  getServerSnapshot = (): AuthSnapshot => {
    const useServerSnapshot = !this.isHydrated && this.initialServerSnapshot;
    if (useServerSnapshot) {
      if (!this.cachedServerSnapshot) {
        this.cachedServerSnapshot = this.initialServerSnapshot;
      }
      return this.cachedServerSnapshot;
    }
    return this.currentSnapshot || this.cachedEmptySnapshot;
  };

  setInitialServerSnapshot(snapshot: AuthSnapshot): void {
    this.initialServerSnapshot = snapshot;
    this.cachedServerSnapshot = snapshot;
  }

  setSnapshot(snapshot: AuthSnapshot): void {
    this.currentSnapshot = snapshot;
    this.notifyListeners();
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  markHydrated(): void {
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
