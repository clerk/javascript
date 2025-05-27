import { logger } from '@clerk/shared/logger';

import { getCurrentTabId, verifyTabIdConsistency } from './generateTabId';
import { debugExistingSharedWorker } from './sharedWorkerDebugger';
import type { SharedWorkerOptions } from './sharedWorkerUtils';

export interface ClerkSharedWorkerMessage {
  type: 'clerk_event';
  payload: {
    event: string;
    data: any;
    timestamp: number;
    clerkInstanceId: string;
  };
}

export class ClerkSharedWorkerManager {
  private worker: SharedWorker | null = null;
  private options: SharedWorkerOptions;
  private clerkInstanceId: string;
  private tabId: string;
  private isSupported: boolean;
  private heartbeatInterval: number | null = null;
  private focusHandler: (() => void) | null = null;
  private blurHandler: (() => void) | null = null;
  private visibilityChangeHandler: (() => void) | null = null;
  private initializationComplete: boolean = false;
  private initializationStartTime: number | null = null;

  constructor(options: SharedWorkerOptions, clerkInstanceId: string) {
    this.options = options;
    this.clerkInstanceId = clerkInstanceId;
    this.tabId = getCurrentTabId();
    this.isSupported = this.checkSharedWorkerSupport();

    if (!verifyTabIdConsistency()) {
      logger.warnOnce('Clerk: Tab ID consistency check failed during SharedWorker initialization');
    }
  }

  private checkSharedWorkerSupport(): boolean {
    return typeof SharedWorker !== 'undefined' && typeof window !== 'undefined';
  }

  /**
   * Initializes the SharedWorker if supported and enabled.
   */
  public async initialize(): Promise<SharedWorker | null> {
    this.initializationStartTime = Date.now();

    if (!this.isSupported) {
      logger.warnOnce('Clerk: SharedWorker is not supported in this environment');
      return null;
    }

    if (!this.options.enabled) {
      logger.warnOnce('Clerk: SharedWorker is disabled');
      return null;
    }

    const scriptUrl = this.options.scriptUrl;

    if (!scriptUrl) {
      logger.warnOnce('Clerk: SharedWorker scriptUrl is required');
      return null;
    }

    try {
      this.worker = new SharedWorker(scriptUrl, this.options.options);

      this.setupMessageHandling();
      this.setupErrorHandling();
      this.setupFocusBlurListeners();

      const initMessage = {
        type: 'clerk_init',
        payload: {
          instanceId: this.clerkInstanceId,
          tabId: this.tabId,
          timestamp: Date.now(),
        },
      };

      logger.logOnce(`Clerk: Sending init message to SharedWorker: ${JSON.stringify(initMessage, null, 2)}`);
      this.postMessage(initMessage);

      this.startHeartbeat();

      if (this.options.onReady) {
        this.options.onReady(this.worker);
      }

      this.initializationComplete = true;
      const initTime = Date.now() - (this.initializationStartTime || Date.now());
      logger.logOnce(`Clerk: SharedWorker initialized successfully for tab ${this.tabId} (${initTime}ms)`);

      return this.worker;
    } catch (error) {
      const err = error as Error;
      logger.warnOnce(`Clerk: Failed to initialize SharedWorker: ${err.message}`);

      if (this.options.onError) {
        this.options.onError(err);
      }

      return null;
    }
  }

  private setupMessageHandling(): void {
    if (!this.worker) return;

    this.worker.port.onmessage = event => {
      try {
        const message = event.data;

        if (message.type === 'clerk_worker_ready') {
          const { connectedTabs, connectedPorts, tabId } = message.payload || {};
          logger.logOnce(
            `Clerk: SharedWorker is ready for tab ${this.tabId}. ` +
              `Connected tabs: ${connectedTabs ?? 'unknown'}, ` +
              `Connected ports: ${connectedPorts ?? 'unknown'}, ` +
              `Worker tab ID: ${tabId}, `,
          );
        } else if (message.type === 'clerk_sync_state') {
          const { sourceTabId, event: syncEvent, data } = message.payload;
          logger.logOnce(`Clerk: Received sync event '${syncEvent}' from tab ${sourceTabId} to tab ${this.tabId}`);

          this.handleSyncEvent(syncEvent, data, sourceTabId);
        } else if (message.type === 'clerk_pong') {
          const { tabs, instances, tabStatus, sessions, hasValidSession, mostRecentSession } = message.payload || {};
          logger.logOnce(`Clerk: Ping response - Tabs: ${tabs ?? 'unknown'}, Instances: ${instances ?? 'unknown'}`);
          if (tabStatus && tabStatus.tabs && tabStatus.tabs.length > 0) {
            console.log(`🔍 [Clerk] Full Worker State:`);
            console.log(`  📊 Summary: ${tabStatus.totalTabs} tabs, Active: ${tabStatus.activeTabId || 'none'}`);
            console.log(`  📋 All Tabs:`, tabStatus.tabs);
            console.log(`  🍪 Sessions:`, sessions || tabStatus.sessions);
            console.log(`  ✅ Has Valid Session: ${hasValidSession ?? tabStatus.hasValidSession}`);
            if (mostRecentSession || tabStatus.mostRecentSession) {
              console.log(`  🕐 Most Recent Session:`, mostRecentSession || tabStatus.mostRecentSession);
            }
          } else if (tabStatus && tabStatus.length > 0) {
            logger.logOnce(`Clerk: Active tabs: ${JSON.stringify(tabStatus, null, 2)}`);
          }
        } else if (message.type === 'clerk_tab_status') {
          const { tabs, activeTabId, totalTabs } = message.payload || {};
          logger.logOnce(`Clerk: Tab status response: ${JSON.stringify(tabs, null, 2)}`);
          logger.logOnce(`Clerk: Active tab: ${activeTabId || 'none'}, Total tabs: ${totalTabs || 0}`);
        } else if (message.type === 'clerk_tab_connected') {
          const { newTabId, newInstanceId, totalTabs, totalPorts } = message.payload || {};
          console.log(
            `🟢 [Clerk] New tab connected! ` +
              `Tab ID: ${newTabId}, ` +
              `Instance: ${newInstanceId}, ` +
              `Total tabs: ${totalTabs}, ` +
              `Total ports: ${totalPorts}`,
          );
          this.requestAndLogWorkerState('tab_connected');
        } else if (message.type === 'clerk_tab_disconnected') {
          const { disconnectedTabId, disconnectedInstanceId, totalTabs, totalPorts } = message.payload || {};
          console.log(
            `🔴 [Clerk] Tab disconnected! ` +
              `Tab ID: ${disconnectedTabId}, ` +
              `Instance: ${disconnectedInstanceId}, ` +
              `Remaining tabs: ${totalTabs}, ` +
              `Remaining ports: ${totalPorts}`,
          );
          this.requestAndLogWorkerState('tab_disconnected');
        } else if (message.type === 'debug_pong') {
          const { workerState, receivedPayload } = message.payload || {};
          console.log('🔍 [Clerk Debug] Debug pong received:', {
            workerState,
            receivedPayload,
            timestamp: new Date().toISOString(),
          });
        } else if (message.type === 'debug_test_response') {
          console.log('🔍 [Clerk Debug] Debug test response:', message.payload);
        } else if (message.type === 'tab_message_received') {
          const { message: tabMessage, sourceTabId, targetTabId: _targetTabId } = message.payload || {};
          console.log(`📨 [Clerk] Message received from tab ${sourceTabId}:`, tabMessage);
        } else if (message.type === 'send_tab_message_response') {
          const { success, targetTabId, sourceTabId: _sourceTabId } = message.payload || {};
          console.log(`📤 [Clerk] Message send result to tab ${targetTabId}: ${success ? 'SUCCESS' : 'FAILED'}`);
        } else if (message.type === 'clerk_tab_focus_response') {
          const { success, activeTabId } = message.payload || {};
          console.log(`🎯 [Clerk] Focus response: ${success ? 'SUCCESS' : 'FAILED'}, active tab: ${activeTabId}`);
        } else if (message.type === 'clerk_tab_blur_response') {
          const { success, tabId } = message.payload || {};
          console.log(`😴 [Clerk] Blur response: ${success ? 'SUCCESS' : 'FAILED'} for tab: ${tabId}`);
        } else if (message.type === 'clerk_active_tab_changed') {
          const { activeTabId, previousActiveTabId } = message.payload || {};
          if (activeTabId) {
            console.log(`✨ [Clerk] Active tab changed: ${previousActiveTabId || 'none'} → ${activeTabId}`);
          } else {
            console.log(`🔄 [Clerk] No active tab (previous: ${previousActiveTabId})`);
          }
          // Auto-request and log worker state when active tab changes
          this.requestAndLogWorkerState('active_tab_changed');
        } else if (message.type === 'clerk_log_message') {
          const { level, message: logMessage, args, source } = message.payload || {};
          const logArgs = [`[${source}]`, logMessage, ...(args || [])];

          switch (level) {
            case 'warn':
              console.warn(...logArgs);
              break;
            case 'error':
              console.error(...logArgs);
              break;
            case 'log':
            default:
              console.log(...logArgs);
              break;
          }
        }
      } catch (error) {
        logger.warnOnce(`Clerk: Error handling SharedWorker message: ${error}`);
      }
    };

    this.worker.port.start();
  }

  private handleSyncEvent(event: string, _: any, sourceTabId: string): void {
    switch (event) {
      case 'state_change':
        logger.logOnce(`Clerk: Auth state synchronized from tab ${sourceTabId}`);
        this.requestAndLogWorkerState('auth_state_changed');
        break;
      case 'sign_out':
        logger.logOnce(`Clerk: Sign out synchronized from tab ${sourceTabId}`);
        this.requestAndLogWorkerState('user_signed_out');
        break;
      case 'session_update':
        logger.logOnce(`Clerk: Session update synchronized from tab ${sourceTabId}`);
        this.requestAndLogWorkerState('session_updated');
        break;
      case 'token_update':
        logger.logOnce(`Clerk: Token update synchronized from tab ${sourceTabId}`);
        this.requestAndLogWorkerState('token_updated');
        break;
      case 'environment_update':
        logger.logOnce(`Clerk: Environment update synchronized from tab ${sourceTabId}`);
        break;
      default:
        logger.logOnce(`Clerk: Unknown sync event '${event}' from tab ${sourceTabId}`);
    }
  }

  private setupErrorHandling(): void {
    if (!this.worker) return;

    this.worker.onerror = error => {
      const errorMessage = `SharedWorker error: ${error.message || 'Unknown error'}`;
      logger.warnOnce(`Clerk: ${errorMessage}`);
      console.error('[Clerk] SharedWorker Error:', error);

      if (this.options.onError) {
        this.options.onError(new Error(errorMessage));
      }
    };

    // Add port error handling
    this.worker.port.onmessageerror = error => {
      const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
      logger.warnOnce(`Clerk: SharedWorker port message error: ${errorMsg}`);
    };

    // Add additional error detection for connection issues
    let initTimeoutId: number | null = null;
    let workerReadyReceived = false;

    // Set up a timeout to detect if the worker never responds
    initTimeoutId = window.setTimeout(() => {
      if (!workerReadyReceived) {
        const errorMsg = 'SharedWorker failed to respond within 5 seconds - possible script loading issue';
        logger.warnOnce(`Clerk: ${errorMsg}`);

        if (this.options.onError) {
          this.options.onError(new Error(errorMsg));
        }
      }
    }, 5000);

    // Listen for the worker ready message to clear the timeout
    const originalOnMessage = this.worker.port.onmessage;
    this.worker.port.onmessage = event => {
      try {
        const message = event.data;
        if (message.type === 'clerk_worker_ready') {
          workerReadyReceived = true;
          if (initTimeoutId !== null) {
            clearTimeout(initTimeoutId);
            initTimeoutId = null;
          }
        }

        // Call the original handler
        if (originalOnMessage && this.worker) {
          originalOnMessage.call(this.worker.port, event);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
        logger.warnOnce(`Clerk: Error in SharedWorker message handler: ${errorMsg}`);
      }
    };
  }

  /**
   * Sets up window focus/blur event listeners to track tab activity.
   */
  private setupFocusBlurListeners(): void {
    if (!this.worker || typeof window === 'undefined') return;

    this.focusHandler = () => {
      console.log(`🎯 [Clerk] Tab ${this.tabId} gained focus - notifying SharedWorker`);
      this.postMessage({
        type: 'clerk_tab_focus',
        payload: {
          tabId: this.tabId,
          timestamp: Date.now(),
        },
      });
    };

    this.blurHandler = () => {
      console.log(`😴 [Clerk] Tab ${this.tabId} lost focus - notifying SharedWorker`);
      this.postMessage({
        type: 'clerk_tab_blur',
        payload: {
          tabId: this.tabId,
          timestamp: Date.now(),
        },
      });
    };

    // Listen for window focus/blur events
    window.addEventListener('focus', this.focusHandler);
    window.addEventListener('blur', this.blurHandler);

    // Also listen for page visibility API as backup
    if (document.visibilityState) {
      this.visibilityChangeHandler = () => {
        if (document.visibilityState === 'visible') {
          this.focusHandler?.();
        } else if (document.visibilityState === 'hidden') {
          this.blurHandler?.();
        }
      };

      document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    }

    // Send initial focus state if tab is currently focused
    if (document.hasFocus()) {
      console.log(`🚀 [Clerk] Tab ${this.tabId} is initially focused - notifying SharedWorker`);
      this.focusHandler();
    }
  }

  /**
   * Posts a message to the SharedWorker.
   */
  public postMessage(message: any): void {
    if (!this.worker) {
      logger.warnOnce('Clerk: Cannot post message - SharedWorker not initialized');
      return;
    }

    try {
      this.worker.port.postMessage(message);
    } catch (error) {
      logger.warnOnce(`Clerk: Error posting message to SharedWorker: ${error.message}`);
    }
  }

  /**
   * Posts a Clerk-specific event to the SharedWorker.
   */
  public postClerkEvent(event: string, data: any): void {
    const message: ClerkSharedWorkerMessage = {
      type: 'clerk_event',
      payload: {
        event,
        data,
        timestamp: Date.now(),
        clerkInstanceId: this.clerkInstanceId,
      },
    };

    this.postMessage(message);
  }

  /**
   * Terminates the SharedWorker.
   */
  public terminate(): void {
    this.stopHeartbeat();
    this.cleanupFocusBlurListeners();

    if (this.worker) {
      this.worker.port.close();
      this.worker = null;
      logger.logOnce('Clerk: SharedWorker terminated');
    }
  }

  /**
   * Returns whether the SharedWorker is currently active.
   */
  public isActive(): boolean {
    return this.worker !== null;
  }

  /**
   * Returns the SharedWorker instance if active.
   */
  public getWorker(): SharedWorker | null {
    return this.worker;
  }

  /**
   * Gets the current tab ID for this SharedWorker instance.
   */
  public getTabId(): string {
    return this.tabId;
  }

  /**
   * Sends a ping to the SharedWorker to get status information.
   */
  public ping(): void {
    this.postMessage({
      type: 'clerk_ping',
      payload: {
        tabId: this.tabId,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Requests tab status information from the SharedWorker.
   */
  public getTabStatus(): void {
    this.postMessage({
      type: 'clerk_get_tab_status',
      payload: {
        tabId: this.tabId,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Automatically requests and logs worker state for debugging purposes.
   */
  private requestAndLogWorkerState(event: string): void {
    console.log(`🔍 [Clerk] Auto-requesting worker state due to: ${event}`);
    this.postMessage({
      type: 'clerk_ping',
      payload: {
        tabId: this.tabId,
        timestamp: Date.now(),
        autoLog: true,
        triggerEvent: event,
      },
    });
  }

  /**
   * Sends a message to another tab via the SharedWorker.
   */
  public sendTabMessage(targetTabId: string, message: any): void {
    if (!this.worker) {
      logger.warnOnce('Clerk: Cannot send tab message - SharedWorker not initialized');
      return;
    }

    const messageData = {
      type: 'send_tab_message',
      payload: {
        targetTabId,
        sourceTabId: this.tabId,
        message,
        timestamp: Date.now(),
      },
    };

    this.postMessage(messageData);
  }

  /**
   * Gets information about the current SharedWorker connection.
   */
  public getConnectionInfo(): { tabId: string; instanceId: string; isActive: boolean } {
    return {
      tabId: this.tabId,
      instanceId: this.clerkInstanceId,
      isActive: this.isActive(),
    };
  }

  /**
   * Runs diagnostic checks on the SharedWorker connection.
   * Useful for debugging connection issues.
   */
  public debug(): void {
    console.log('🔍 [Clerk SharedWorker] Starting debug session...');
    console.log(`  - Tab ID: ${this.tabId}`);
    console.log(`  - Instance ID: ${this.clerkInstanceId}`);
    console.log(`  - Worker active: ${this.isActive()}`);
    console.log(`  - Initialization complete: ${this.initializationComplete}`);

    if (this.initializationStartTime) {
      const elapsed = Date.now() - this.initializationStartTime;
      console.log(`  - Initialization time: ${elapsed}ms`);
    }

    console.log(`  - Script URL: ${this.options.scriptUrl}`);
    console.log(`  - Options:`, this.options);

    if (this.worker) {
      debugExistingSharedWorker(this.worker, this.tabId);
    } else {
      console.log('❌ [Clerk SharedWorker] No worker instance available for debugging');
    }
  }

  /**
   * Gets detailed initialization status information.
   */
  public getInitializationStatus(): {
    isComplete: boolean;
    isActive: boolean;
    initializationTime: number | null;
    tabId: string;
    instanceId: string;
  } {
    return {
      isComplete: this.initializationComplete,
      isActive: this.isActive(),
      initializationTime: this.initializationStartTime ? Date.now() - this.initializationStartTime : null,
      tabId: this.tabId,
      instanceId: this.clerkInstanceId,
    };
  }

  /**
   * Starts a heartbeat to keep the SharedWorker connection alive.
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.worker) {
        this.postMessage({
          type: 'clerk_heartbeat',
          payload: {
            tabId: this.tabId,
            instanceId: this.clerkInstanceId,
            timestamp: Date.now(),
          },
        });
      }
    }, 120000);
  }

  /**
   * Stops the heartbeat.
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private cleanupFocusBlurListeners(): void {
    if (typeof window === 'undefined') return;

    // Remove event listeners
    if (this.focusHandler) {
      window.removeEventListener('focus', this.focusHandler);
      this.focusHandler = null;
    }

    if (this.blurHandler) {
      window.removeEventListener('blur', this.blurHandler);
      this.blurHandler = null;
    }

    if (this.visibilityChangeHandler && document.visibilityState) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
  }

  /**
   * Simple diagnostic test for SharedWorker functionality
   */
  public testConnection(): void {
    if (!this.worker) {
      console.log('❌ [Clerk] SharedWorker not initialized');
      return;
    }

    console.log('🔍 [Clerk] Testing SharedWorker connection...');
    console.log(`  - Tab ID: ${this.tabId}`);
    console.log(`  - Instance ID: ${this.clerkInstanceId}`);
    console.log(`  - Worker exists: ${!!this.worker}`);
    console.log(`  - Initialization complete: ${this.initializationComplete}`);

    // Send a test ping
    this.postMessage({
      type: 'debug_ping',
      payload: {
        tabId: this.tabId,
        testMessage: 'Connection test from tab',
        timestamp: Date.now(),
      },
    });

    console.log('📤 [Clerk] Test ping sent to SharedWorker');
  }
}
