class ClerkSharedWorkerState {
  constructor() {
    this.activeTabId = null;
    this.connectedPorts = new Set();
    this.tabRegistry = new Map();
  }

  addPort(port, tabId = null) {
    this.connectedPorts.add(port);

    if (tabId) {
      this.tabRegistry.set(tabId, {
        port,
        lastActivity: Date.now(),
        connectedAt: Date.now(),
        state: null,
      });

      this.log(`Port connected. Tab: ${tabId}. Total ports: ${this.connectedPorts.size}`);

      if (this.tabRegistry.size > 1) {
        this.broadcastToOtherTabs(tabId, {
          type: 'clerk_tab_connected',
          payload: {
            event: 'tab_connected',
            newTabId: tabId,
            totalTabs: this.tabRegistry.size,
            totalPorts: this.connectedPorts.size,
            timestamp: Date.now(),
          },
        });
      }
    }
  }

  removePort(port) {
    this.connectedPorts.delete(port);

    for (const [tabId, tabData] of this.tabRegistry.entries()) {
      if (tabData.port === port) {
        this.tabRegistry.delete(tabId);

        if (this.tabRegistry.size > 0) {
          this.broadcastToAllPorts({
            type: 'clerk_tab_disconnected',
            payload: {
              event: 'tab_disconnected',
              disconnectedTabId: tabId,
              totalTabs: this.tabRegistry.size,
              totalPorts: this.connectedPorts.size,
              timestamp: Date.now(),
            },
          });
        } else {
          this.log(`🏁 Last tab ${tabId} disconnected - no more active tabs`);
          this.activeTabId = null;
        }
        break;
      }
    }
  }

  broadcastToOtherTabs(senderTabId, message) {
    for (const [tabId, tabData] of this.tabRegistry.entries()) {
      if (tabId !== senderTabId) {
        try {
          tabData.port.postMessage({
            ...message,
            sourceTabId: senderTabId,
            targetTabId: tabId,
          });
        } catch (error) {
          this.removePort(tabData.port);
        }
      }
    }
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
        this.removePort(tabData.port);
        return false;
      }
    }
    return false;
  }

  postLogMessage(level, message, ...args) {
    this.broadcastToAllPorts({
      type: 'clerk_log_message',
      payload: {
        level,
        message,
        args,
        timestamp: Date.now(),
        source: 'ClerkSharedWorker',
      },
    });
  }

  log(message, ...args) {
    this.postLogMessage('log', message, ...args);
  }

  warn(message, ...args) {
    this.postLogMessage('warn', message, ...args);
  }

  error(message, ...args) {
    this.postLogMessage('error', message, ...args);
  }

  handleClerkEvent(port, event, data) {
    const tabId = data.tabId || null;

    if (tabId && this.tabRegistry.has(tabId)) {
      const tabData = this.tabRegistry.get(tabId);
      tabData.lastActivity = Date.now();

      if (tabData.state) {
        tabData.state = { ...tabData.state, ...data };
      } else {
        tabData.state = { ...data };
      }
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
        break;
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
    this.lastTokenState = null;

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
    this.lastTokenState = {
      token: data.token,
      hasToken: data.hasToken,
      timestamp: data.timestamp,
      sourceTabId,
    };

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
      tabs.push({
        tabId,
        lastActivity: tabData.lastActivity,
        connectedAt: tabData.connectedAt,
        state: tabData.state,
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
    return false;
  }
}

const clerkState = new ClerkSharedWorkerState();

// Log that the worker is ready
clerkState.log('[ClerkSharedWorker] SharedWorker script loaded and ready');

self.addEventListener('connect', event => {
  const port = event.ports[0];

  port.onmessage = messageEvent => {
    const { type, payload } = messageEvent.data;

    switch (type) {
      case 'clerk_init':
        clerkState.log(`Received init message:`, payload);
        clerkState.addPort(port, payload.tabId);

        const responsePayload = {
          timestamp: Date.now(),
          connectedPorts: clerkState.connectedPorts.size,
          connectedTabs: clerkState.tabRegistry.size,
          tabId: payload.tabId,
        };

        clerkState.log(`Sending ready response:`, responsePayload);

        port.postMessage({
          type: 'clerk_worker_ready',
          payload: responsePayload,
        });
        break;

      case 'clerk_event':
        clerkState.handleClerkEvent(port, payload.event, payload.data);
        break;

      case 'clerk_ping':
        port.postMessage({
          type: 'clerk_pong',
          payload: {
            timestamp: Date.now(),
            instances: clerkState.tabRegistry.size,
            ports: clerkState.connectedPorts.size,
            tabs: clerkState.tabRegistry.size,
            activeTabId: clerkState.activeTabId,
            tabStatus: clerkState.getTabStatus(),
          },
        });
        break;

      case 'clerk_tab_focus':
        const previousActive = clerkState.activeTabId;

        clerkState.setActiveTab(payload.tabId);

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
        if (clerkState.activeTabId === payload.tabId) {
          clerkState.activeTabId = null;

          clerkState.broadcastToAllPorts({
            type: 'clerk_active_tab_changed',
            payload: {
              event: 'active_tab_changed',
              activeTabId: null,
              previousActiveTabId: payload.tabId,
              timestamp: Date.now(),
            },
          });
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
        port.postMessage({
          type: 'clerk_tab_status',
          payload: {
            timestamp: Date.now(),
            ...tabStatusData,
          },
        });
        break;

      case 'debug_test':
        port.postMessage({
          type: 'debug_test_response',
          payload: {
            ...payload,
            response: 'Test successful',
            timestamp: Date.now(),
            workerStatus: {
              connectedPorts: clerkState.connectedPorts.size,
              connectedTabs: clerkState.tabRegistry.size,
              instances: clerkState.tabRegistry.size,
            },
          },
        });
        break;

      case 'debug_ping':
        port.postMessage({
          type: 'debug_pong',
          payload: {
            timestamp: Date.now(),
            receivedPayload: payload,
            workerState: {
              connectedPorts: clerkState.connectedPorts.size,
              connectedTabs: clerkState.tabRegistry.size,
              instances: clerkState.tabRegistry.size,
              tabRegistry: Array.from(clerkState.tabRegistry.keys()),
              activeTabId: clerkState.activeTabId,
              lastAuthState: clerkState.lastAuthState ? 'present' : 'null',
              lastTokenState: clerkState.lastTokenState ? 'present' : 'null',
            },
          },
        });
        break;

      case 'clerk_heartbeat':
        const { tabId: heartbeatTabId } = payload;

        if (heartbeatTabId && clerkState.tabRegistry.has(heartbeatTabId)) {
          clerkState.tabRegistry.get(heartbeatTabId).lastActivity = Date.now();
        }
        break;

      case 'clerk_get_token':
        port.postMessage({
          type: 'clerk_token_response',
          payload: {
            token: clerkState.lastTokenState?.token || null,
            hasToken: clerkState.lastTokenState?.hasToken || false,
            timestamp: Date.now(),
            tokenTimestamp: clerkState.lastTokenState?.timestamp || null,
            sourceTabId: clerkState.lastTokenState?.sourceTabId || null,
          },
        });
        break;

      case 'send_tab_message':
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

        break;

      default:
        break;
    }
  };

  port.onmessageerror = error => {
    debugger;
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
