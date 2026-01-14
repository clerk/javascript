/**
 * Registers React and ReactDOM on the global shared modules registry.
 * Import this before loading @clerk/ui's shared variant to enable dependency sharing.
 */
export {};

declare global {
  var __clerkSharedModules:
    | {
        react: typeof import('react');
        'react-dom': typeof import('react-dom');
        'react/jsx-runtime': typeof import('react/jsx-runtime');
      }
    | undefined;
}
