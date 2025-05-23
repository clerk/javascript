// Safe console wrapper for SharedWorker environment
const safeConsole = {
  log: (...args) => {
    try {
      if (typeof console !== 'undefined' && console.log) {
        console.log(...args);
      }
    } catch (e) {
      // Silent fail if console is not available
    }
  },
  warn: (...args) => {
    try {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(...args);
      }
    } catch (e) {
      // Silent fail if console is not available
    }
  },
  error: (...args) => {
    try {
      if (typeof console !== 'undefined' && console.error) {
        console.error(...args);
      }
    } catch (e) {
      // Silent fail if console is not available
    }
  },
};

class ClerkSharedWorkerState {
  constructor() {
    this.connectedPorts = new Set();
    this.clerkInstances = new Map();
    this.tabRegistry = new Map();
    this.lastAuthState = null;
    this.lastSessionState = null;
    this.activeTabId = null;
  }

  addPort(port, instanceId, tabId = null) {
    this.connectedPorts.add(port);

    if (instanceId) {
      const instanceData = {
        port,
        tabId,
        connectedAt: Date.now(),
        lastActivity: Date.now(),
        state: null,
      };

      this.clerkInstances.set(instanceId, instanceData);

      if (tabId) {
        this.tabRegistry.set(tabId, {
          instanceId,
          port,
          lastActivity: Date.now(),
        });
        safeConsole.log(
          `[ClerkSharedWorker] ➕ Added tab ${tabId} to registry. Registry size: ${this.tabRegistry.size}`,
        );

        if (this.tabRegistry.size > 1) {
          this.broadcastToOtherTabs(tabId, {
            type: 'clerk_tab_connected',
            payload: {
              event: 'tab_connected',
              newTabId: tabId,
              newInstanceId: instanceId,
              totalTabs: this.tabRegistry.size,
              totalPorts: this.connectedPorts.size,
              timestamp: Date.now(),
            },
          });

          safeConsole.log(
            `[ClerkSharedWorker] 📢 Notified ${this.tabRegistry.size - 1} existing tabs about new tab ${tabId}`,
          );
        } else {
          safeConsole.log(`[ClerkSharedWorker] 🏠 Tab ${tabId} is the first tab in this session`);
        }
      } else {
        safeConsole.warn(`[ClerkSharedWorker] No tabId provided for instance ${instanceId}`);
      }
    }

    safeConsole.log(
      `[ClerkSharedWorker] Port connected. Instance: ${instanceId}, Tab: ${tabId}. Total ports: ${this.connectedPorts.size}`,
    );
    this.logConnectionStatus();
  }

  removePort(port) {
    this.connectedPorts.delete(port);

    for (const [instanceId, data] of this.clerkInstances.entries()) {
      if (data.port === port) {
        const tabId = data.tabId;
        this.clerkInstances.delete(instanceId);

        if (tabId) {
          this.tabRegistry.delete(tabId);

          if (this.tabRegistry.size > 0) {
            this.broadcastToAllPorts({
              type: 'clerk_tab_disconnected',
              payload: {
                event: 'tab_disconnected',
                disconnectedTabId: tabId,
                disconnectedInstanceId: instanceId,
                totalTabs: this.tabRegistry.size,
                totalPorts: this.connectedPorts.size,
                timestamp: Date.now(),
              },
            });

            safeConsole.log(
              `[ClerkSharedWorker] 📢 Notified ${this.tabRegistry.size} remaining tabs about disconnection of tab ${tabId}`,
            );
          } else {
            safeConsole.log(`[ClerkSharedWorker] 🏁 Last tab ${tabId} disconnected - no more active tabs`);
          }

          if (this.activeTabId === tabId) {
            safeConsole.log(`[ClerkSharedWorker] 🔄 Active tab ${tabId} disconnected - clearing active state`);
            this.activeTabId = null;
          }
        }

        safeConsole.log(
          `[ClerkSharedWorker] ➖ Port disconnected. Instance: ${instanceId}, Tab: ${tabId}. Total ports: ${this.connectedPorts.size}`,
        );
        this.logConnectionStatus();
        break;
      }
    }
  }

  logConnectionStatus() {
    const tabs = Array.from(this.tabRegistry.keys());
    safeConsole.log(`[ClerkSharedWorker] Active tabs: ${tabs.length} [${tabs.join(', ')}]`);
  }

  broadcastToOtherTabs(senderTabId, message) {
    let broadcastCount = 0;

    for (const [tabId, tabData] of this.tabRegistry.entries()) {
      if (tabId !== senderTabId) {
        try {
          tabData.port.postMessage({
            ...message,
            sourceTabId: senderTabId,
            targetTabId: tabId,
          });
          broadcastCount++;
        } catch (error) {
          safeConsole.warn(`[ClerkSharedWorker] Failed to send message to tab ${tabId}:`, error);
          this.removePort(tabData.port);
        }
      }
    }

    safeConsole.log(`[ClerkSharedWorker] Broadcasted message to ${broadcastCount} other tabs`);
  }

  broadcastToOtherPorts(senderPort, message) {
    let senderTabId = null;

    for (const [tabId, tabData] of this.tabRegistry.entries()) {
      if (tabData.port === senderPort) {
        senderTabId = tabId;
        break;
      }
    }

    if (senderTabId) {
      this.broadcastToOtherTabs(senderTabId, message);
    } else {
      for (const port of this.connectedPorts) {
        if (port !== senderPort) {
          try {
            port.postMessage(message);
          } catch (error) {
            safeConsole.warn('[ClerkSharedWorker] Failed to send message to port:', error);
            this.removePort(port);
          }
        }
      }
    }
  }

  broadcastToAllPorts(message) {
    for (const port of this.connectedPorts) {
      try {
        port.postMessage(message);
      } catch (error) {
        safeConsole.warn('[ClerkSharedWorker] Failed to send message to port:', error);
        this.removePort(port);
      }
    }
  }

  broadcastToSpecificTab(targetTabId, message) {
    const tabData = this.tabRegistry.get(targetTabId);
    if (tabData) {
      try {
        tabData.port.postMessage({
          ...message,
          targetTabId,
        });
        return true;
      } catch (error) {
        safeConsole.warn(`[ClerkSharedWorker] Failed to send message to tab ${targetTabId}:`, error);
        this.removePort(tabData.port);
        return false;
      }
    }
    return false;
  }

  handleClerkEvent(port, event, data, instanceId) {
    const tabId = data.tabId || null;
    safeConsole.log(`[ClerkSharedWorker] Received Clerk event: ${event} from tab ${tabId}`, data);

    if (instanceId && this.clerkInstances.has(instanceId)) {
      const instanceData = this.clerkInstances.get(instanceId);
      instanceData.lastActivity = Date.now();
      instanceData.state = data;
    }

    if (tabId && this.tabRegistry.has(tabId)) {
      this.tabRegistry.get(tabId).lastActivity = Date.now();
    }

    switch (event) {
      case 'clerk:state_change':
        this.handleStateChange(port, data, tabId);
        break;
      case 'clerk:sign_out':
        this.handleSignOut(port, data, tabId);
        break;
      case 'clerk:session_update':
        this.handleSessionUpdate(port, data, tabId);
        break;
      case 'clerk:token_update':
        this.handleTokenUpdate(port, data, tabId);
        break;
      case 'clerk:environment_update':
        this.handleEnvironmentUpdate(port, data, tabId);
        break;
      default:
        safeConsole.log(`[ClerkSharedWorker] Unknown event: ${event}`);
    }
  }

  handleStateChange(port, data, sourceTabId) {
    const stateChanged =
      this.lastAuthState?.isSignedIn !== data.isSignedIn ||
      this.lastAuthState?.user !== data.user ||
      this.lastAuthState?.session !== data.session ||
      this.lastAuthState?.organization !== data.organization;

    if (stateChanged) {
      this.lastAuthState = data;
      safeConsole.log(`[ClerkSharedWorker] Auth state changed in tab ${sourceTabId}, syncing to other tabs`);

      this.broadcastToOtherPorts(port, {
        type: 'clerk_sync_state',
        payload: {
          event: 'state_change',
          data,
          timestamp: Date.now(),
          sourceTabId,
        },
      });
    }
  }

  handleSignOut(port, data, sourceTabId) {
    this.lastAuthState = null;
    this.lastSessionState = null;

    safeConsole.log(`[ClerkSharedWorker] Sign out event from tab ${sourceTabId}, syncing to all other tabs`);

    this.broadcastToOtherPorts(port, {
      type: 'clerk_sync_state',
      payload: {
        event: 'sign_out',
        data,
        timestamp: Date.now(),
        sourceTabId,
      },
    });
  }

  handleSessionUpdate(port, data, sourceTabId) {
    const sessionChanged = this.lastSessionState?.sessionId !== data.sessionId;

    if (sessionChanged) {
      this.lastSessionState = data;
      safeConsole.log(`[ClerkSharedWorker] Session updated in tab ${sourceTabId}, syncing to other tabs`);

      this.broadcastToOtherPorts(port, {
        type: 'clerk_sync_state',
        payload: {
          event: 'session_update',
          data,
          timestamp: Date.now(),
          sourceTabId,
        },
      });
    }
  }

  handleTokenUpdate(port, data, sourceTabId) {
    safeConsole.log(`[ClerkSharedWorker] Token updated in tab ${sourceTabId}, syncing to other tabs`);

    this.broadcastToOtherPorts(port, {
      type: 'clerk_sync_state',
      payload: {
        event: 'token_update',
        data,
        timestamp: Date.now(),
        sourceTabId,
      },
    });
  }

  handleEnvironmentUpdate(port, data, sourceTabId) {
    safeConsole.log(`[ClerkSharedWorker] Environment updated in tab ${sourceTabId}, syncing to other tabs`);

    this.broadcastToOtherPorts(port, {
      type: 'clerk_sync_state',
      payload: {
        event: 'environment_update',
        data,
        timestamp: Date.now(),
        sourceTabId,
      },
    });
  }

  getTabStatus() {
    const tabs = [];
    for (const [tabId, tabData] of this.tabRegistry.entries()) {
      const instanceData = this.clerkInstances.get(tabData.instanceId);
      tabs.push({
        tabId,
        instanceId: tabData.instanceId,
        lastActivity: tabData.lastActivity,
        connectedAt: instanceData?.connectedAt,
        state: instanceData?.state,
        isActive: tabId === this.activeTabId,
      });
    }
    return {
      tabs,
      activeTabId: this.activeTabId,
      totalTabs: this.tabRegistry.size,
    };
  }

  setActiveTab(tabId) {
    if (this.tabRegistry.has(tabId)) {
      const previousActiveTab = this.activeTabId;
      this.activeTabId = tabId;

      if (previousActiveTab && previousActiveTab !== tabId) {
        safeConsole.log(`[ClerkSharedWorker] ✨ Active tab switched: ${previousActiveTab} → ${tabId}`);
      } else if (!previousActiveTab) {
        safeConsole.log(`[ClerkSharedWorker] 🎉 Tab ${tabId} is now the first active tab`);
      } else {
        safeConsole.log(`[ClerkSharedWorker] 🔄 Tab ${tabId} remains active`);
      }

      this.broadcastToAllPorts({
        type: 'clerk_active_tab_changed',
        payload: {
          event: 'active_tab_changed',
          activeTabId: tabId,
          previousActiveTabId: previousActiveTab,
          timestamp: Date.now(),
        },
      });

      return true;
    }
    safeConsole.warn(`[ClerkSharedWorker] ⚠️ Attempted to set unknown tab ${tabId} as active`);
    return false;
  }
}

const clerkState = new ClerkSharedWorkerState();

self.addEventListener('connect', event => {
  const port = event.ports[0];

  port.onmessage = messageEvent => {
    const { type, payload } = messageEvent.data;

    switch (type) {
      case 'clerk_init':
        safeConsole.log(`[ClerkSharedWorker] Received init message:`, payload);
        clerkState.addPort(port, payload.instanceId, payload.tabId);

        const responsePayload = {
          timestamp: Date.now(),
          connectedPorts: clerkState.connectedPorts.size,
          connectedTabs: clerkState.tabRegistry.size,
          tabId: payload.tabId,
          instanceId: payload.instanceId,
        };

        safeConsole.log(`[ClerkSharedWorker] Sending ready response:`, responsePayload);

        port.postMessage({
          type: 'clerk_worker_ready',
          payload: responsePayload,
        });
        break;

      case 'clerk_event':
        clerkState.handleClerkEvent(port, payload.event, payload.data, payload.clerkInstanceId);
        break;

      case 'clerk_ping':
        port.postMessage({
          type: 'clerk_pong',
          payload: {
            timestamp: Date.now(),
            instances: clerkState.clerkInstances.size,
            ports: clerkState.connectedPorts.size,
            tabs: clerkState.tabRegistry.size,
            activeTabId: clerkState.activeTabId,
            tabStatus: clerkState.getTabStatus(),
          },
        });
        break;

      case 'clerk_tab_focus':
        const previousActive = clerkState.activeTabId;
        safeConsole.log(`[ClerkSharedWorker] 🎯 Tab ${payload.tabId} gained focus`);
        if (previousActive && previousActive !== payload.tabId) {
          safeConsole.log(`[ClerkSharedWorker] 📋 Active tab changed: ${previousActive} → ${payload.tabId}`);
        } else if (!previousActive) {
          safeConsole.log(`[ClerkSharedWorker] 🚀 First tab became active: ${payload.tabId}`);
        }

        clerkState.setActiveTab(payload.tabId);

        safeConsole.log(
          `[ClerkSharedWorker] 📊 Tab status: ${clerkState.tabRegistry.size} total tabs, ${payload.tabId} is active`,
        );

        port.postMessage({
          type: 'clerk_tab_focus_response',
          payload: {
            success: true,
            activeTabId: payload.tabId,
            timestamp: Date.now(),
          },
        });
        break;

      case 'clerk_tab_blur':
        safeConsole.log(`[ClerkSharedWorker] 😴 Tab ${payload.tabId} lost focus`);

        if (clerkState.activeTabId === payload.tabId) {
          safeConsole.log(`[ClerkSharedWorker] 🔄 Active tab ${payload.tabId} is now inactive - clearing active state`);
          clerkState.activeTabId = null;

          safeConsole.log(`[ClerkSharedWorker] 📊 Tab status: ${clerkState.tabRegistry.size} total tabs, none active`);

          clerkState.broadcastToAllPorts({
            type: 'clerk_active_tab_changed',
            payload: {
              event: 'active_tab_changed',
              activeTabId: null,
              previousActiveTabId: payload.tabId,
              timestamp: Date.now(),
            },
          });
        } else {
          safeConsole.log(
            `[ClerkSharedWorker] ℹ️ Tab ${payload.tabId} lost focus, but it wasn't the active tab (active: ${clerkState.activeTabId})`,
          );
        }

        port.postMessage({
          type: 'clerk_tab_blur_response',
          payload: {
            success: true,
            tabId: payload.tabId,
            timestamp: Date.now(),
          },
        });
        break;

      case 'clerk_get_tab_status':
        const tabStatusData = clerkState.getTabStatus();
        safeConsole.log(`[ClerkSharedWorker] Sending tab status:`, tabStatusData);
        port.postMessage({
          type: 'clerk_tab_status',
          payload: {
            timestamp: Date.now(),
            ...tabStatusData,
          },
        });
        break;

      case 'debug_test':
        safeConsole.log(`[ClerkSharedWorker] Debug test received:`, payload);
        port.postMessage({
          type: 'debug_test_response',
          payload: {
            ...payload,
            response: 'Test successful',
            timestamp: Date.now(),
            workerStatus: {
              connectedPorts: clerkState.connectedPorts.size,
              connectedTabs: clerkState.tabRegistry.size,
              instances: clerkState.clerkInstances.size,
            },
          },
        });
        break;

      case 'debug_ping':
        safeConsole.log(`[ClerkSharedWorker] Debug ping received from tab ${payload.tabId}:`, payload);
        port.postMessage({
          type: 'debug_pong',
          payload: {
            timestamp: Date.now(),
            receivedPayload: payload,
            workerState: {
              connectedPorts: clerkState.connectedPorts.size,
              connectedTabs: clerkState.tabRegistry.size,
              instances: clerkState.clerkInstances.size,
              tabRegistry: Array.from(clerkState.tabRegistry.keys()),
              activeTabId: clerkState.activeTabId,
              lastAuthState: clerkState.lastAuthState ? 'present' : 'null',
            },
          },
        });
        break;

      case 'clerk_heartbeat':
        const { tabId: heartbeatTabId, instanceId: heartbeatInstanceId } = payload;

        if (heartbeatInstanceId && clerkState.clerkInstances.has(heartbeatInstanceId)) {
          clerkState.clerkInstances.get(heartbeatInstanceId).lastActivity = Date.now();
        }

        if (heartbeatTabId && clerkState.tabRegistry.has(heartbeatTabId)) {
          clerkState.tabRegistry.get(heartbeatTabId).lastActivity = Date.now();
        }

        safeConsole.log(`[ClerkSharedWorker] Heartbeat received from tab ${heartbeatTabId}`);
        break;

      case 'send_tab_message':
        safeConsole.log(
          `[ClerkSharedWorker] Message forwarding request from tab ${payload.sourceTabId} to tab ${payload.targetTabId}:`,
          payload.message,
        );

        let sourceTabId = payload.sourceTabId;
        if (!sourceTabId) {
          for (const [tabId, tabData] of clerkState.tabRegistry.entries()) {
            if (tabData.port === port) {
              sourceTabId = tabId;
              break;
            }
          }
        }

        const messageSent = clerkState.broadcastToSpecificTab(payload.targetTabId, {
          type: 'tab_message_received',
          payload: {
            message: payload.message,
            sourceTabId: sourceTabId,
            targetTabId: payload.targetTabId,
            timestamp: Date.now(),
          },
        });

        port.postMessage({
          type: 'send_tab_message_response',
          payload: {
            success: messageSent,
            targetTabId: payload.targetTabId,
            sourceTabId: sourceTabId,
            message: payload.message,
            timestamp: Date.now(),
          },
        });

        if (messageSent) {
          safeConsole.log(
            `[ClerkSharedWorker] Successfully forwarded message from tab ${sourceTabId} to tab ${payload.targetTabId}`,
          );
        } else {
          safeConsole.warn(
            `[ClerkSharedWorker] Failed to forward message from tab ${sourceTabId} to tab ${payload.targetTabId} - target tab not found`,
          );
        }
        break;

      default:
        safeConsole.warn(`[ClerkSharedWorker] Unknown message type: ${type}`);
    }
  };

  port.onmessageerror = error => {
    safeConsole.error('[ClerkSharedWorker] Message error:', error);
  };

  port.addEventListener('close', () => {
    clerkState.removePort(port);
  });

  port.start();
});

// setInterval(() => {
//   const now = Date.now();
//   const staleThreshold = 300000;

//   for (const [instanceId, data] of clerkState.clerkInstances.entries()) {
//     if (now - data.lastActivity > staleThreshold) {
//       console.log(`[ClerkSharedWorker] Cleaning up stale instance: ${instanceId}, tab: ${data.tabId}`);
//       clerkState.removePort(data.port);
//     }
//   }

//   for (const [tabId, tabData] of clerkState.tabRegistry.entries()) {
//     if (now - tabData.lastActivity > staleThreshold) {
//       console.log(`[ClerkSharedWorker] Cleaning up stale tab: ${tabId}`);
//       if (clerkState.clerkInstances.has(tabData.instanceId)) {
//         const instanceData = clerkState.clerkInstances.get(tabData.instanceId);
//         clerkState.removePort(instanceData.port);
//       }
//     }
//   }
// }, 30000);

safeConsole.log('[ClerkSharedWorker] SharedWorker script loaded and ready for tab coordination');

