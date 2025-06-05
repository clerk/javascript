/**
 * Generates unique tab IDs for SharedWorker coordination
 *
 * This module provides a comprehensive tab identification system for Clerk's SharedWorker
 * functionality. Each browser tab gets a unique identifier that persists for the duration
 * of the session, enabling proper coordination between multiple tabs.
 *
 * Key features:
 * - Unique tab IDs with multiple entropy sources (timestamp, random, performance)
 * - Session storage persistence for consistency within the same tab
 * - Clerk instance IDs that embed the tab ID for traceability
 * - Utility functions for extracting and verifying tab ID consistency
 *
 * The tab ID format: tab_[timestamp]_[random]_[session]_[performance]
 * The instance ID format: clerk_[keyFragment]_[tabId]_[timestamp]
 */

/**
 * Generates a random string ID
 */
function generateRandomId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a unique tab ID based on multiple factors for better uniqueness
 */
export function generateUniqueTabId(): string {
  const timestamp = Date.now().toString(36); // Base36 for shorter string
  const randomId = generateRandomId(6);
  const sessionId = Math.random().toString(36).substr(2, 6);

  const performanceTime = typeof performance !== 'undefined' ? performance.now().toString(36).replace('.', '') : '';

  return `tab_${timestamp}_${randomId}_${sessionId}${performanceTime ? '_' + performanceTime : ''}`;
}

/**
 * Generates a unique Clerk instance ID that includes tab identification
 */
export function generateClerkInstanceId(publishableKey: string): string {
  const keyFragment = publishableKey.slice(-8);
  const tabId = getCurrentTabId(); // Use the existing tab ID instead of generating a new one
  const timestamp = Date.now();

  return `clerk_${keyFragment}_${tabId}_${timestamp}`;
}

/**
 * Extracts the tab ID from a Clerk instance ID
 */
export function extractTabIdFromInstanceId(instanceId: string): string | null {
  const parts = instanceId.split('_');
  if (parts.length >= 4 && parts[0] === 'clerk') {
    const tabIdParts = parts.slice(2, -1);
    return tabIdParts.join('_');
  }
  return null;
}

/**
 * Global tab ID - generated once per tab session
 */
let globalTabId: string | null = null;

/**
 * Gets the current tab's unique ID (creates one if it doesn't exist)
 */
export function getCurrentTabId(): string {
  if (!globalTabId) {
    globalTabId = generateUniqueTabId();

    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem('clerk_tab_id', globalTabId);
      } catch {
        console.warn(`[Clerk] Failed to set tab ID in sessionStorage`);
      }
    }
  }

  return globalTabId;
}

/**
 * Initialize tab ID from sessionStorage if available
 */
if (typeof sessionStorage !== 'undefined') {
  try {
    const storedTabId = sessionStorage.getItem('clerk_tab_id');
    if (storedTabId) {
      globalTabId = storedTabId;
    }
  } catch {
    console.warn(`[Clerk] Failed to initialize tab ID from sessionStorage`);
  }
}

/**
 * Verifies that the tab ID generation and extraction work correctly
 * @internal
 */
export function verifyTabIdConsistency(): boolean {
  try {
    const tabId = getCurrentTabId();
    const instanceId = generateClerkInstanceId('pk_test_abcd1234');
    const extractedTabId = extractTabIdFromInstanceId(instanceId);

    const isConsistent = tabId === extractedTabId;

    if (!isConsistent) {
      console.warn(
        `[Clerk] Tab ID consistency check failed. Original: ${tabId}, Extracted: ${extractedTabId}, Instance: ${instanceId}`,
      );
    }

    return isConsistent;
  } catch (error) {
    console.warn(`[Clerk] Tab ID verification failed:`, error);
    return false;
  }
}
