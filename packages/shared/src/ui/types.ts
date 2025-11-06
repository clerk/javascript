/**
 * UI-related types and utilities
 */

// Placeholder - Add UI-specific types and utilities here
export type UIVersion = string;

// TODO: replace with a proper interface
export type MountComponentRenderer = (
  clerk: any,
  environment: any,
  options: any,
) => {
  ensureMounted: (options?: { preloadHint?: string }) => Promise<{
    mountImpersonationFab: () => void;
    updateProps: (props: any) => void;
    openModal: (name: string, props: any) => void;
    closeModal: (name: string) => void;
    openDrawer: (name: string, props: any) => void;
    closeDrawer: (name: string) => void;
    mountComponent: (config: any) => void;
    unmountComponent: (config: any) => void;
    prefetch: (name: string) => void;
  }>;
};

export interface ClerkUiEntry {
  resolve: () => Promise<MountComponentRenderer>;
}
