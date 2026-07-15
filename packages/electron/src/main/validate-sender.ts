import type { IpcMainInvokeEvent } from 'electron';

// Restricts privileged IPC to a window's top-level frame so untrusted subframes/webviews sharing the Clerk preload cannot reach it.
export function isMainFrameEvent(event: IpcMainInvokeEvent): boolean {
  return Boolean(event.senderFrame) && event.senderFrame === event.sender.mainFrame;
}
