/**
 * Cross-Tab Session Sync Worker
 *
 * This worker manages session state synchronization across browser tabs without polling.
 * It handles token refresh scheduling, session state validation, and coordinates with
 * the main thread via MessageChannel.
 */

interface SessionState {
  expiresAt: number | null;
  lastRefreshed: number;
  organizationId: string | null;
  refreshScheduled: boolean;
  sessionId: string | null;
}

interface WorkerMessage {
  data: unknown;
  type: string;
}

interface SessionUpdateMessage extends WorkerMessage {
  data: {
    expiresAt: number | null;
    organizationId: string | null;
    sessionId: string | null;
  };
  type: 'session:update';
}

interface RefreshRequestMessage extends WorkerMessage {
  type: 'session:refresh-request';
}

interface RefreshCompleteMessage extends WorkerMessage {
  data: {
    expiresAt: number;
    timestamp: number;
  };
  type: 'session:refresh-complete';
}

interface PingMessage extends WorkerMessage {
  type: 'ping';
}

interface ClearMessage extends WorkerMessage {
  type: 'session:clear';
}

type IncomingMessage =
  | ClearMessage
  | PingMessage
  | RefreshCompleteMessage
  | RefreshRequestMessage
  | SessionUpdateMessage;

let sessionState: SessionState = {
  expiresAt: null,
  lastRefreshed: Date.now(),
  organizationId: null,
  refreshScheduled: false,
  sessionId: null,
};

let refreshTimerId: ReturnType<typeof setTimeout> | null = null;

const REFRESH_BUFFER_MS = 60_000;
const MIN_REFRESH_INTERVAL_MS = 30_000;

function scheduleRefresh(expiresAt: number): void {
  if (refreshTimerId !== null) {
    clearTimeout(refreshTimerId);
    refreshTimerId = null;
  }

  const now = Date.now();
  const timeUntilExpiry = expiresAt - now;
  const refreshTime = Math.max(timeUntilExpiry - REFRESH_BUFFER_MS, MIN_REFRESH_INTERVAL_MS);

  if (refreshTime > 0) {
    sessionState.refreshScheduled = true;
    refreshTimerId = setTimeout(() => {
      if (sessionState.sessionId) {
        self.postMessage({ type: 'session:needs-refresh' });
      }
      sessionState.refreshScheduled = false;
      refreshTimerId = null;
    }, refreshTime);
  }
}

function updateSession(data: SessionUpdateMessage['data']): void {
  const hasSessionChanged =
    sessionState.sessionId !== data.sessionId || sessionState.organizationId !== data.organizationId;

  sessionState = {
    ...sessionState,
    expiresAt: data.expiresAt,
    organizationId: data.organizationId,
    sessionId: data.sessionId,
  };

  if (hasSessionChanged && refreshTimerId) {
    clearTimeout(refreshTimerId);
    refreshTimerId = null;
    sessionState.refreshScheduled = false;
  }

  if (data.expiresAt && data.sessionId) {
    scheduleRefresh(data.expiresAt);
  }
}

function clearSession(): void {
  if (refreshTimerId !== null) {
    clearTimeout(refreshTimerId);
    refreshTimerId = null;
  }

  sessionState = {
    expiresAt: null,
    lastRefreshed: Date.now(),
    organizationId: null,
    refreshScheduled: false,
    sessionId: null,
  };
}

function handleRefreshComplete(data: RefreshCompleteMessage['data']): void {
  sessionState.lastRefreshed = data.timestamp;

  if (data.expiresAt) {
    scheduleRefresh(data.expiresAt);
  }
}

self.addEventListener('message', (event: MessageEvent<IncomingMessage>) => {
  const message = event.data;

  switch (message.type) {
    case 'session:update':
      updateSession(message.data);
      break;

    case 'session:refresh-request':
      if (sessionState.sessionId) {
        self.postMessage({ type: 'session:needs-refresh' });
      }
      break;

    case 'session:refresh-complete':
      handleRefreshComplete(message.data);
      break;

    case 'session:clear':
      clearSession();
      break;

    case 'ping':
      if (sessionState.expiresAt && sessionState.sessionId && !sessionState.refreshScheduled) {
        scheduleRefresh(sessionState.expiresAt);
      }
      self.postMessage({ data: sessionState, type: 'pong' });
      break;

    default:
      break;
  }
});

self.postMessage({ type: 'ready' });

export {};


