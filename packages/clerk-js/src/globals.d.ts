declare global {
  const __DEV__: boolean;
  const __CLERKJS_VERSION__: string;
}

declare module '*.svg' {
  const value: React.FC<React.SVGAttributes<SVGElement>>;
  export default value;
}

export {};
