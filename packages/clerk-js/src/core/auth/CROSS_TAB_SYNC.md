# Cross-Tab Session Sync Implementation

## Overview

This implementation replaces the localStorage polling mechanism with an event-driven Worker-based architecture for cross-tab session synchronization. It provides real-time session updates across browser tabs without the performance overhead of polling.

## Architecture

### Core Components

1. **`crossTabSync.worker.ts`** - Web Worker that handles:

   - Token expiration tracking
   - Automatic refresh scheduling (60s before expiry)
   - Session state management
   - Off-main-thread processing

2. **`CrossTabSessionSync.ts`** - Main coordinator that manages:

   - BroadcastChannel messaging between tabs
   - Leader election (ensures only one tab manages backend sync)
   - Worker communication via MessageChannel
   - Automatic leader re-election on tab close

3. **`SessionRefreshCoordinator.ts`** - Drop-in replacement for `SessionCookiePoller`:

   - Automatic feature detection
   - Graceful fallback to polling when Workers/BroadcastChannel unavailable
   - Zero-config API (same interface as SessionCookiePoller)

4. **`AuthCookieService.ts`** - Integration point:
   - Updated to use SessionRefreshCoordinator
   - Broadcasts session updates across tabs
   - Syncs session state on cookie changes

## How It Works

### Leader Election

- Each tab generates a unique ID on load
- Tabs use BroadcastChannel to elect a leader (lowest ID wins)
- Leader sends heartbeat every 5 seconds
- If leader crashes, other tabs detect timeout (10s) and elect new leader
- Only the leader tab makes backend API calls for token refresh

### Token Refresh Flow

1. Worker calculates when token needs refresh (exp - 60s)
2. Worker schedules refresh and notifies main thread when needed
3. Leader tab receives notification and calls `session.getToken()`
4. New token is broadcast to all tabs via BroadcastChannel
5. All tabs update their session state simultaneously

### Fallback Strategy

```
1. Try: Worker + BroadcastChannel (event-driven, best performance)
   ↓ (if Worker unavailable)
2. Fallback: SessionCookiePoller (5s polling, legacy support)
```

## Key Benefits

- **Zero Polling**: Eliminates 5-second interval checks
- **Real-time Sync**: Instant session updates across all tabs
- **Lower CPU Usage**: Off-main-thread processing via Worker
- **Coordinated Refresh**: Only one tab calls backend API
- **Automatic Failover**: Leader re-election handles tab crashes
- **Zero Config**: Automatic feature detection and fallback
- **Backward Compatible**: Same API as SessionCookiePoller

## Browser Support

### Full Support (Event-driven mode)

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

### Fallback Support (Polling mode)

- IE 11
- Older browsers without Worker or BroadcastChannel

## Build Configuration

Worker files (`.worker.ts`) are:

1. Compiled from TypeScript
2. Minified and optimized
3. Bundled as inline strings
4. No external file loading required

See `rspack.config.js` for the `workerLoader()` configuration.

## Usage

The SessionRefreshCoordinator is automatically used by AuthCookieService. No code changes needed:

```typescript
// Existing code continues to work
this.authService.startPollingForToken();
```

Behind the scenes, it now uses Worker-based sync when available!

### Feature Flag & Runtime Overrides

- The build flag `__BUILD_EXPERIMENTAL_CROSS_TAB_SYNC__` enables the worker path in local development and keeps it disabled in production bundles.
- A runtime override is available without shipping code:
  - `window.__clerkCrossTabSync = 'enabled' | 'disabled'`
  - or `localStorage.setItem('clerk:crossTabSessionSync', 'enabled')`
- Remove the key or set it to `'disabled'` to force the legacy poller.

### Metric Hook

Every significant cross-tab lifecycle event dispatches `clerk:crossTabMetric` on `window`. This makes playground verification trivial:

```ts
window.addEventListener('clerk:crossTabMetric', event => {
  console.log('[clerk:metric]', event.detail);
});
```

Sample events:

- `leader_elected` / `leader_resigned`
- `refresh_request_forwarded` / `refresh_request_received`
- `fatal_error` (followed by automatic fallback)
- `mode_selected`, `polling_started`, `fallback_activated`

## Monitoring

Debug logs are available under the `crossTabSync` and `sessionRefresh` categories:

```typescript
// Enable in browser console
localStorage.setItem('clerk:debug', 'crossTabSync,sessionRefresh');
```

## Future Enhancements (Deferred)

- Comprehensive test suite (integration tests with Playwright)
- Conflict resolution strategies for race conditions
- Optimistic updates for better UX
- Session history/undo capabilities
- SharedWorker support for shared state across origins
- Performance metrics and health monitoring

## Files Changed

- `packages/clerk-js/src/core/auth/crossTabSync.worker.ts` (new)
- `packages/clerk-js/src/core/auth/CrossTabSessionSync.ts` (new)
- `packages/clerk-js/src/core/auth/SessionRefreshCoordinator.ts` (new)
- `packages/clerk-js/src/core/auth/AuthCookieService.ts` (modified)
- `packages/clerk-js/src/global.d.ts` (modified)
- `packages/clerk-js/rspack.config.js` (modified)

## Testing

To test the implementation:

1. Open multiple tabs with a Clerk app
2. Sign in on one tab
3. Verify all tabs update immediately
4. Close the leader tab (check console for "Became leader" in another tab)
5. Verify token refresh continues seamlessly
6. Check Network tab - only one tab should call `/v1/client`

Automated coverage:

- `SessionRefreshCoordinator` unit tests (`core/auth/__tests__/SessionRefreshCoordinator.test.ts`) cover feature gating, fallback selection, and fatal-error recovery.
- Multi-tab smoke tests listed above remain the source of truth for worker scheduling until dedicated integration coverage lands.

## Notes

- The worker is automatically terminated when AuthCookieService stops
- All cross-tab messages include timestamp and sender ID for debugging
- Leader election uses deterministic ID comparison (lexicographic order)
- Session state includes sessionId, organizationId, and expiration time


