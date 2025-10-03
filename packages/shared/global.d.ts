declare const PACKAGE_NAME: string;
declare const PACKAGE_VERSION: string;
declare const JS_PACKAGE_VERSION: string;
declare const __DEV__: boolean;

interface ImportMetaEnv {
  readonly [key: string]: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'virtual:data-hooks/*' {
  // Generic export signatures to satisfy type resolution for virtual modules
  export const DataClientProvider: any;
  export const useSubscription: any;
  const mod: any;
  export default mod;
}
