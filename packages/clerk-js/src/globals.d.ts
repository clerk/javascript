declare global {
  const __DEV__: boolean;
  const __STAGING__: boolean;
  const __PKG_NAME__: string;
  const __PKG_VERSION__: string;

  const __CLERK_FF_ENABLE_IMAGES__: boolean;

  interface Window {
    __unstable__onBeforeSetActive: () => void;
    __unstable__onAfterSetActive: () => void;
  }
}

declare module '*.svg' {
  const value: React.FC<React.SVGAttributes<SVGElement>>;
  export default value;
}

export {};
