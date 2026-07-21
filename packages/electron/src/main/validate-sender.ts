import type { IpcMainInvokeEvent } from 'electron';

// Restricts privileged IPC to a top-level BrowserWindow's main frame. The frame check alone
// only proves the sender is the top document of *its own* WebContents, so a <webview> (a separate
// WebContents) sharing the Clerk preload would still pass; requiring getType() === 'window' rejects
// <webview> guests and BrowserViews, and the frame check rejects in-page iframes.
export function isMainFrameEvent(event: IpcMainInvokeEvent): boolean {
  const { sender, senderFrame } = event;
  return sender.getType() === 'window' && Boolean(senderFrame) && senderFrame === sender.mainFrame;
}
