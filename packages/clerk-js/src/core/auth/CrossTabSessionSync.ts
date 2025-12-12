import { noop } from '@clerk/shared/utils';

import { debugLogger } from '@/utils/debug';

// @ts-ignore
// eslint-disable-next-line import/default
import crossTabSyncWorkerSource from './crossTabSync.worker';

const LEADER_HEARTBEAT_INTERVAL = 5_000;
const LEADER_TIMEOUT = 10_000;
const TAB_ID = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

type CrossTabSessionSyncFailure = 'broadcast_unavailable' | 'worker_error';

interface CrossTabMessage {
  data?: unknown;
  tabId: string;
  timestamp: number;
  type: string;
}

interface SessionSyncMessage extends CrossTabMessage {
  data: {
    expiresAt: number | null;
    organizationId: string | null;
    sessionId: string | null;
  };
  type: 'session:sync';
}

interface LeaderElectMessage extends CrossTabMessage {
  type: 'leader:elect';
}

interface LeaderHeartbeatMessage extends CrossTabMessage {
  type: 'leader:heartbeat';
}

interface LeaderResignMessage extends CrossTabMessage {
  type: 'leader:resign';
}

interface RefreshRequestMessage extends CrossTabMessage {
  type: 'session:refresh-needed';
}

interface SignoutMessage extends CrossTabMessage {
  type: 'signout';
}

type BroadcastMessage =
  | LeaderElectMessage
  | LeaderHeartbeatMessage
  | LeaderResignMessage
  | RefreshRequestMessage
  | SessionSyncMessage
  | SignoutMessage;

interface WorkerIncomingMessage {
  data?: unknown;
  type: string;
}

interface SessionUpdateMessage extends WorkerIncomingMessage {
  data: {
    expiresAt: number | null;
    organizationId: string | null;
    sessionId: string | null;
  };
  type: 'session:update';
}

interface RefreshCompleteMessage extends WorkerIncomingMessage {
  data: {
    expiresAt: number;
    timestamp: number;
  };
  type: 'session:refresh-complete';
}

export interface CrossTabSessionSyncOptions {
  onFatalError?: (reason: CrossTabSessionSyncFailure) => void;
  onRefreshNeeded?: () => Promise<void>;
  onSessionSync?: (sessionId: string | null, organizationId: string | null) => void;
  onSignout?: () => void;
}

/**
 * CrossTabSessionSync manages session state synchronization across browser tabs
 * without polling. Uses Worker + BroadcastChannel for event-driven updates.
 *
 * Features:
 * - Leader election ensures only one tab manages backend sync
 * - Automatic token refresh coordination
 * - Graceful fallback when Worker/BroadcastChannel unavailable
 * - Zero-config drop-in replacement for SessionCookiePoller
 */
export class CrossTabSessionSync {
  private broadcastChannel: BroadcastChannel | null = null;
  private heartbeatTimerId: ReturnType<typeof setInterval> | null = null;
  private isLeader = false;
  private lastLeaderHeartbeat = Date.now();
  private leaderTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private options: Required<CrossTabSessionSyncOptions>;
  private started = false;
  private tabId = TAB_ID;
  private visibilityChangeHandler: (() => void) | null = null;
  private worker: Worker | null = null;
  private workerScriptUrl: string | null = null;

  constructor(options: CrossTabSessionSyncOptions = {}) {
    this.options = {
      onFatalError: options.onFatalError || noop,
      onRefreshNeeded: options.onRefreshNeeded || (() => Promise.resolve()),
      onSessionSync: options.onSessionSync || noop,
      onSignout: options.onSignout || noop,
    };
  }

  start(): boolean {
    if (this.started) {
      return true;
    }

    if (!this.canUseBrowserAPIs()) {
      debugLogger.warn('CrossTabSessionSync: Browser APIs unavailable', {}, 'crossTabSync');
      return false;
    }

    this.started = true;

    if (!this.initializeWorker()) {
      debugLogger.warn('CrossTabSessionSync: Worker initialization failed', {}, 'crossTabSync');
      this.started = false;
      return false;
    }

    if (!this.initializeBroadcastChannel()) {
      debugLogger.warn('CrossTabSessionSync: BroadcastChannel initialization failed', {}, 'crossTabSync');
      this.cleanup();
      this.started = false;
      return false;
    }

    this.initiateLeaderElection();
    this.setupBeforeUnloadHandler();
    this.setupVisibilityChangeHandler();

    debugLogger.info('CrossTabSessionSync: Started', { tabId: this.tabId }, 'crossTabSync');
    return true;
  }

  stop(): void {
    if (!this.started) {
      return;
    }

    this.started = false;

    if (this.isLeader) {
      this.broadcastMessage({ tabId: this.tabId, timestamp: Date.now(), type: 'leader:resign' });
    }

    this.cleanup();

    debugLogger.info('CrossTabSessionSync: Stopped', { tabId: this.tabId }, 'crossTabSync');
  }

  /**
   * Update session state across all tabs
   */
  updateSession(sessionId: string | null, organizationId: string | null, expiresAt: number | null): void {
    const message: SessionUpdateMessage = {
      data: {
        expiresAt,
        organizationId,
        sessionId,
      },
      type: 'session:update',
    };

    this.worker?.postMessage(message);

    this.broadcastMessage({
      data: {
        expiresAt,
        organizationId,
        sessionId,
      },
      tabId: this.tabId,
      timestamp: Date.now(),
      type: 'session:sync',
    });
  }

  /**
   * Notify worker that refresh completed
   */
  notifyRefreshComplete(expiresAt: number): void {
    const message: RefreshCompleteMessage = {
      data: {
        expiresAt,
        timestamp: Date.now(),
      },
      type: 'session:refresh-complete',
    };

    this.worker?.postMessage(message);
  }

  clearSession(): void {
    this.worker?.postMessage({ type: 'session:clear' });

    this.broadcastMessage({
      data: { expiresAt: null, organizationId: null, sessionId: null },
      tabId: this.tabId,
      timestamp: Date.now(),
      type: 'session:sync',
    });
  }

  private initializeWorker(): boolean {
    if (typeof Worker === 'undefined') {
      return false;
    }

    try {
      const blob = new Blob([crossTabSyncWorkerSource], { type: 'application/javascript; charset=utf-8' });
      const workerScript = globalThis.URL.createObjectURL(blob);
      this.workerScriptUrl = workerScript;
      this.worker = new Worker(workerScript, { name: 'clerk-session-sync' });

      this.worker.addEventListener('message', (event: MessageEvent<WorkerIncomingMessage>) => {
        this.handleWorkerMessage(event.data);
      });

      this.worker.addEventListener('error', error => {
        debugLogger.error('CrossTabSessionSync: Worker error', { error: error.message }, 'crossTabSync');
        this.handleFatalError('worker_error', error);
      });

      return true;
    } catch (error) {
      debugLogger.warn(
        'CrossTabSessionSync: Cannot create worker from blob. Consider adding worker-src blob:; to your CSP',
        error,
        'crossTabSync',
      );
      return false;
    }
  }

  private initializeBroadcastChannel(): boolean {
    if (typeof BroadcastChannel === 'undefined') {
      debugLogger.warn('CrossTabSessionSync: BroadcastChannel not available', {}, 'crossTabSync');
      return false;
    }

    try {
      this.broadcastChannel = new BroadcastChannel('clerk:session_sync');
      this.broadcastChannel.addEventListener('message', (event: MessageEvent<BroadcastMessage>) => {
        this.handleBroadcastMessage(event.data);
      });
      return true;
    } catch (error) {
      debugLogger.warn('CrossTabSessionSync: Failed to create BroadcastChannel', error, 'crossTabSync');
      return false;
    }
  }

  private handleWorkerMessage(message: WorkerIncomingMessage): void {
    switch (message.type) {
      case 'ready':
        debugLogger.info('CrossTabSessionSync: Worker ready', { tabId: this.tabId }, 'crossTabSync');
        break;

      case 'session:needs-refresh':
        if (this.isLeader) {
          this.emitMetric('refresh_request_handled', { role: 'leader' });
          void this.options.onRefreshNeeded();
        } else {
          this.emitMetric('refresh_request_forwarded', { role: 'member' });
          this.broadcastMessage({
            tabId: this.tabId,
            timestamp: Date.now(),
            type: 'session:refresh-needed',
          });
        }
        break;

      case 'pong':
        debugLogger.info('CrossTabSessionSync: Worker pong', { data: message.data, tabId: this.tabId }, 'crossTabSync');
        break;

      default:
        break;
    }
  }

  private handleBroadcastMessage(message: BroadcastMessage): void {
    if (message.tabId === this.tabId) {
      return;
    }

    switch (message.type) {
      case 'leader:elect':
        this.handleLeaderElection(message);
        break;

      case 'leader:heartbeat':
        this.handleLeaderHeartbeat(message);
        break;

      case 'leader:resign':
        this.handleLeaderResignation(message);
        break;

      case 'session:sync':
        this.handleSessionSync(message);
        break;

      case 'session:refresh-needed':
        if (this.isLeader) {
          this.emitMetric('refresh_request_received', { from: message.tabId });
          void this.options.onRefreshNeeded();
        }
        break;

      case 'signout':
        this.options.onSignout();
        break;

      default:
        break;
    }
  }

  private initiateLeaderElection(): void {
    this.broadcastMessage({
      tabId: this.tabId,
      timestamp: Date.now(),
      type: 'leader:elect',
    });

    setTimeout(() => {
      if (!this.isLeader && Date.now() - this.lastLeaderHeartbeat > LEADER_TIMEOUT) {
        this.becomeLeader();
      } else {
        this.startLeaderMonitoring();
      }
    }, 100);
  }

  private handleLeaderElection(message: LeaderElectMessage): void {
    if (this.isLeader) {
      this.broadcastMessage({
        tabId: this.tabId,
        timestamp: Date.now(),
        type: 'leader:heartbeat',
      });
    } else if (message.tabId < this.tabId) {
      this.startLeaderMonitoring();
    }
  }

  private handleLeaderHeartbeat(message: LeaderHeartbeatMessage): void {
    this.lastLeaderHeartbeat = message.timestamp;

    if (this.isLeader && message.tabId !== this.tabId) {
      if (message.tabId < this.tabId) {
        this.resignLeadership();
      }
    }

    if (!this.isLeader) {
      this.startLeaderMonitoring();
    }
  }

  private handleLeaderResignation(_message: LeaderResignMessage): void {
    if (!this.isLeader && Date.now() - this.lastLeaderHeartbeat > 1000) {
      this.becomeLeader();
    }
  }

  private handleSessionSync(message: SessionSyncMessage): void {
    const { sessionId, organizationId, expiresAt } = message.data;

    this.worker?.postMessage({
      data: {
        expiresAt,
        organizationId,
        sessionId,
      },
      type: 'session:update',
    });

    this.options.onSessionSync(sessionId, organizationId);
    this.emitMetric('session_sync', {
      from: message.tabId,
      hasOrganization: Boolean(organizationId),
      hasSession: Boolean(sessionId),
    });
  }

  private becomeLeader(): void {
    if (this.isLeader) {
      return;
    }

    this.isLeader = true;
    this.lastLeaderHeartbeat = Date.now();

    if (this.leaderTimeoutId) {
      clearTimeout(this.leaderTimeoutId);
      this.leaderTimeoutId = null;
    }

    this.heartbeatTimerId = setInterval(() => {
      this.broadcastMessage({
        tabId: this.tabId,
        timestamp: Date.now(),
        type: 'leader:heartbeat',
      });
    }, LEADER_HEARTBEAT_INTERVAL);

    debugLogger.info('CrossTabSessionSync: Became leader', { tabId: this.tabId }, 'crossTabSync');
    this.emitMetric('leader_elected');
  }

  private resignLeadership(): void {
    if (!this.isLeader) {
      return;
    }

    this.isLeader = false;

    if (this.heartbeatTimerId) {
      clearInterval(this.heartbeatTimerId);
      this.heartbeatTimerId = null;
    }

    this.startLeaderMonitoring();

    debugLogger.info('CrossTabSessionSync: Resigned leadership', { tabId: this.tabId }, 'crossTabSync');
    this.emitMetric('leader_resigned');
  }

  private startLeaderMonitoring(): void {
    if (this.leaderTimeoutId) {
      clearTimeout(this.leaderTimeoutId);
    }

    this.leaderTimeoutId = setTimeout(() => {
      if (Date.now() - this.lastLeaderHeartbeat > LEADER_TIMEOUT) {
        this.becomeLeader();
      }
    }, LEADER_TIMEOUT);
  }

  private broadcastMessage(message: BroadcastMessage): void {
    try {
      this.broadcastChannel?.postMessage(message);
    } catch (error) {
      debugLogger.warn('CrossTabSessionSync: Failed to broadcast message', error, 'crossTabSync');
      if (this.started) {
        this.handleFatalError('broadcast_unavailable', error);
      }
    }
  }

  private setupBeforeUnloadHandler(): void {
    if (!this.canUseBrowserAPIs()) {
      return;
    }

    window.addEventListener('beforeunload', () => {
      if (this.isLeader) {
        this.broadcastMessage({
          tabId: this.tabId,
          timestamp: Date.now(),
          type: 'leader:resign',
        });
      }
    });
  }

  private canUseBrowserAPIs(): boolean {
    return typeof window !== 'undefined' && typeof window.addEventListener === 'function';
  }

  private cleanup(): void {
    if (this.heartbeatTimerId) {
      clearInterval(this.heartbeatTimerId);
      this.heartbeatTimerId = null;
    }

    if (this.leaderTimeoutId) {
      clearTimeout(this.leaderTimeoutId);
      this.leaderTimeoutId = null;
    }

    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.revokeWorkerScriptUrl();
    this.teardownVisibilityChangeHandler();

    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
  }

  private emitMetric(event: string, payload: Record<string, unknown> = {}): void {
    const detail = { ...payload, event, source: 'crossTab', tabId: this.tabId, timestamp: Date.now() };
    debugLogger.info('CrossTabSessionSync: Metric', detail, 'crossTabSync');

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
      debugLogger.warn('CrossTabSessionSync: Failed to dispatch metric event', error, 'crossTabSync');
    }
  }

  private handleFatalError(reason: CrossTabSessionSyncFailure, error?: unknown): void {
    debugLogger.warn('CrossTabSessionSync: Fatal error encountered', { error, reason }, 'crossTabSync');
    this.emitMetric('fatal_error', { reason });
    if (this.started) {
      this.stop();
    } else {
      this.cleanup();
    }

    this.options.onFatalError(reason);
  }

  private revokeWorkerScriptUrl(): void {
    if (!this.workerScriptUrl) {
      return;
    }

    try {
      globalThis.URL.revokeObjectURL(this.workerScriptUrl);
    } catch (error) {
      debugLogger.warn('CrossTabSessionSync: Failed to revoke worker URL', error, 'crossTabSync');
    } finally {
      this.workerScriptUrl = null;
    }
  }

  private setupVisibilityChangeHandler(): void {
    if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') {
      return;
    }

    const handler = () => {
      if (document.visibilityState === 'visible') {
        this.worker?.postMessage({ type: 'ping' });
      }
    };

    document.addEventListener('visibilitychange', handler);
    this.visibilityChangeHandler = handler;
  }

  private teardownVisibilityChangeHandler(): void {
    if (
      !this.visibilityChangeHandler ||
      typeof document === 'undefined' ||
      typeof document.removeEventListener !== 'function'
    ) {
      return;
    }

    document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    this.visibilityChangeHandler = null;
  }
}
