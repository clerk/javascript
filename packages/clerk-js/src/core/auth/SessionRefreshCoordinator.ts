import { debugLogger } from '@/utils/debug';

import { CrossTabSessionSync } from './CrossTabSessionSync';
import { SafeLock } from './safeLock';
import { SessionCookiePoller } from './SessionCookiePoller';

const REFRESH_SESSION_TOKEN_LOCK_KEY = 'clerk.lock.refreshSessionToken';

interface SessionInfo {
  expiresAt: number | null;
  organizationId: string | null;
  sessionId: string | null;
}

interface SessionRefreshCoordinatorOptions {
  enableEventDrivenSync?: boolean;
}

/**
 * SessionRefreshCoordinator provides an event-driven alternative to SessionCookiePoller.
 * It uses CrossTabSessionSync for Worker-based coordination and falls back to polling
 * when Workers/BroadcastChannel are unavailable.
 *
 * Key features:
 * - Zero-config drop-in replacement for SessionCookiePoller
 * - Automatic fallback to polling for compatibility
 * - Leader-based refresh coordination (only one tab refreshes)
 * - Cross-tab session state synchronization
 */
export class SessionRefreshCoordinator {
  private crossTabSync: CrossTabSessionSync | null = null;
  private fallbackPoller: SessionCookiePoller | null = null;
  private lock = SafeLock(REFRESH_SESSION_TOKEN_LOCK_KEY);
  private refreshCallback: (() => Promise<unknown>) | null = null;
  private refreshInFlight = false;
  private started = false;
  private useEventDriven = false;

  /**
   * Start session refresh coordination
   */
  public startPollingForSessionToken(cb: () => Promise<unknown>, options: SessionRefreshCoordinatorOptions = {}): void {
    if (this.started) {
      return;
    }

    this.started = true;
    this.refreshCallback = cb;

    const { enableEventDrivenSync = false } = options;
    if (enableEventDrivenSync && this.tryInitializeEventDriven()) {
      this.useEventDriven = true;
      debugLogger.info('SessionRefreshCoordinator: Using event-driven sync', {}, 'sessionRefresh');
      this.emitMetric('mode_selected', { mode: 'event-driven' });
    } else {
      const fallbackReason = enableEventDrivenSync ? 'event_driven_unavailable' : 'feature_disabled';
      this.startFallback();
      debugLogger.info(
        'SessionRefreshCoordinator: Using polling fallback',
        {
          reason: fallbackReason,
        },
        'sessionRefresh',
      );
      this.emitMetric('mode_selected', { mode: 'polling', reason: fallbackReason });
    }
  }

  /**
   * Stop session refresh coordination
   */
  public stopPollingForSessionToken(): void {
    if (!this.started) {
      return;
    }

    this.started = false;
    this.refreshCallback = null;

    this.stopCrossTabSync();

    if (this.fallbackPoller) {
      this.fallbackPoller.stopPollingForSessionToken();
      this.fallbackPoller = null;
    }

    this.useEventDriven = false;
  }

  /**
   * Update session state across all tabs (event-driven mode only)
   */
  public updateSession(sessionInfo: SessionInfo): void {
    if (this.useEventDriven && this.crossTabSync) {
      this.crossTabSync.updateSession(sessionInfo.sessionId, sessionInfo.organizationId, sessionInfo.expiresAt);
    }
  }

  /**
   * Notify that a token refresh completed successfully
   */
  public notifyRefreshComplete(expiresAt: number): void {
    if (this.useEventDriven && this.crossTabSync) {
      this.crossTabSync.notifyRefreshComplete(expiresAt);
    }
  }

  /**
   * Clear session state across all tabs
   */
  public clearSession(): void {
    if (this.useEventDriven && this.crossTabSync) {
      this.crossTabSync.clearSession();
    }
  }

  /**
   * Check if using event-driven mode
   */
  public isEventDriven(): boolean {
    return this.useEventDriven;
  }

  private tryInitializeEventDriven(): boolean {
    if (typeof window === 'undefined') {
      debugLogger.warn('SessionRefreshCoordinator: Window not available for event-driven sync', {}, 'sessionRefresh');
      return false;
    }

    if (typeof Worker === 'undefined' || typeof BroadcastChannel === 'undefined') {
      return false;
    }

    try {
      this.crossTabSync = new CrossTabSessionSync({
        onFatalError: reason => {
          this.handleFatalSyncError(reason);
        },
        onRefreshNeeded: async () => {
          await this.executeRefresh();
        },
        onSessionSync: (sessionId, organizationId) => {
          debugLogger.info(
            'SessionRefreshCoordinator: Session synced from another tab',
            { organizationId, sessionId },
            'sessionRefresh',
          );
        },
        onSignout: () => {
          debugLogger.info('SessionRefreshCoordinator: Signout received from another tab', {}, 'sessionRefresh');
        },
      });

      const started = this.crossTabSync.start();
      if (!started) {
        this.stopCrossTabSync();
        return false;
      }

      return true;
    } catch (error) {
      debugLogger.warn('SessionRefreshCoordinator: Failed to initialize event-driven sync', error, 'sessionRefresh');

      this.stopCrossTabSync();

      return false;
    }
  }

  private initializeFallback(): void {
    this.fallbackPoller = new SessionCookiePoller();
    if (this.refreshCallback) {
      this.fallbackPoller.startPollingForSessionToken(this.refreshCallback);
    }
  }

  private handleFatalSyncError(reason: string): void {
    debugLogger.warn('SessionRefreshCoordinator: Falling back to polling after fatal error', { reason }, 'sessionRefresh');
    this.useEventDriven = false;
    this.stopCrossTabSync();
    this.startFallback();
    this.emitMetric('fallback_activated', { reason });
  }

  private startFallback(): void {
    const reused = !!this.fallbackPoller;
    if (!this.fallbackPoller) {
      this.initializeFallback();
    } else if (this.refreshCallback) {
      this.fallbackPoller.startPollingForSessionToken(this.refreshCallback);
    }

    this.emitMetric('polling_started', { reused });
  }

  private stopCrossTabSync(): void {
    if (this.crossTabSync) {
      this.crossTabSync.stop();
      this.crossTabSync = null;
    }
  }

  private async executeRefresh(): Promise<void> {
    if (!this.refreshCallback) {
      return;
    }

    if (this.refreshInFlight) {
      debugLogger.info('SessionRefreshCoordinator: Duplicate refresh attempt prevented', {}, 'sessionRefresh');
      this.emitMetric('duplicate_refresh_blocked', { mode: this.useEventDriven ? 'event-driven' : 'polling' });
      return;
    }

    this.refreshInFlight = true;

    try {
      const result = await this.lock.acquireLockAndRun(this.refreshCallback);
      const lockAcquired = result !== false;
      if (!lockAcquired) {
        debugLogger.info('SessionRefreshCoordinator: Refresh skipped (lock contention)', {}, 'sessionRefresh');
      }

      this.emitMetric('refresh_attempt_completed', {
        lockAcquired,
        mode: this.useEventDriven ? 'event-driven' : 'polling',
      });
    } catch (error) {
      debugLogger.error('SessionRefreshCoordinator: Refresh failed', error, 'sessionRefresh');
      this.emitMetric('refresh_attempt_failed', { mode: this.useEventDriven ? 'event-driven' : 'polling' });
    } finally {
      this.refreshInFlight = false;
    }
  }

  private emitMetric(event: string, payload: Record<string, unknown> = {}): void {
    const detail = { ...payload, event, source: 'sessionRefresh', timestamp: Date.now() };
    debugLogger.info('SessionRefreshCoordinator: Metric', detail, 'sessionRefresh');

    if (
      typeof window === 'undefined' ||
      typeof window.dispatchEvent !== 'function' ||
      typeof CustomEvent !== 'function'
    ) {
      return;
    }

    try {
      window.dispatchEvent(new CustomEvent('clerk:crossTabMetric', { detail }));
    } catch (error) {
      debugLogger.warn('SessionRefreshCoordinator: Failed to dispatch metric event', error, 'sessionRefresh');
    }
  }
}
