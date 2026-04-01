/**
 * Register React dependencies for sharing with @clerk/ui's shared variant.
 *
 * Import this module BEFORE loading the ui.shared.browser.js bundle:
 *
 * ```js
 * import '@clerk/ui/register';
 * // Now load clerk-js which will load ui.shared.browser.js
 * ```
 *
 * This enables @clerk/ui to use the host app's React instead of bundling its own,
 * reducing the overall bundle size.
 */

import * as react from 'react';
import * as reactDom from 'react-dom';
import * as reactDomClient from 'react-dom/client';
import * as jsxRuntime from 'react/jsx-runtime';

// Only register if not already registered to avoid overwriting with potentially
// different React versions in complex module resolution scenarios.
if (globalThis.__clerkSharedModules) {
  // Warn if the already-registered React version differs from this import.
  // This could indicate multiple React versions in the bundle, which may cause issues.
  const existingVersion = globalThis.__clerkSharedModules.react?.version;
  if (existingVersion && existingVersion !== react.version) {
    console.warn(
      `[@clerk/ui/register] React version mismatch detected. ` +
        `Already registered: ${existingVersion}, current import: ${react.version}. ` +
        `This may cause issues with the shared @clerk/ui variant.`,
    );
  }
} else {
  globalThis.__clerkSharedModules = {
    react,
    'react-dom': reactDom,
    'react-dom/client': reactDomClient,
    'react/jsx-runtime': jsxRuntime,
  };
}
