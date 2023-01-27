declare global {
  interface Window {
    __unstable__onBeforeSetActive: () => void;
    __unstable__onAfterSetActive: () => void;
  }
}

export * from './client';
