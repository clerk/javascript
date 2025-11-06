import type { AuthContextValue } from '../contexts/AuthContext';

type AuthSnapshot = AuthContextValue;
type Listener = () => void;

class AuthStore {
  private listeners = new Set<Listener>();
  private currentSnapshot: AuthSnapshot | null = null;
  private initialServerSnapshot: AuthSnapshot | null = null;
  private isHydrated = false;

  getClientSnapshot = (): AuthSnapshot => {
    return this.currentSnapshot || this.getEmptySnapshot();
  };

  getServerSnapshot = (): AuthSnapshot => {
    if (!this.isHydrated && this.initialServerSnapshot) {
      return this.initialServerSnapshot;
    }
    return this.currentSnapshot || this.getEmptySnapshot();
  };

  setInitialServerSnapshot(snapshot: AuthSnapshot): void {
    this.initialServerSnapshot = snapshot;
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

