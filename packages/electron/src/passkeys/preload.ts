import { contextBridge, ipcRenderer } from 'electron';

import { PASSKEY_CHANNELS } from '../shared/ipc';
import type { PasskeyBridge } from '../shared/types';

/** Exposes the native passkey bridge to the renderer. */
export function setupPasskeysPreload(): void {
  const bridge: PasskeyBridge = {
    create: options => ipcRenderer.invoke(PASSKEY_CHANNELS.create, options),
    get: options => ipcRenderer.invoke(PASSKEY_CHANNELS.get, options),
    capabilities: () => ipcRenderer.invoke(PASSKEY_CHANNELS.capabilities),
    electronMajor: Number.parseInt(process.versions.electron ?? '', 10) || 0,
    platform: process.platform,
  };

  if (process.contextIsolated) {
    contextBridge.exposeInMainWorld('__clerk_internal_electron_passkeys', bridge);
  } else {
    window.__clerk_internal_electron_passkeys = bridge;
  }
}
