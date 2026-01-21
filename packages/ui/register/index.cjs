/**
 * Register React dependencies for sharing with @clerk/ui's shared variant.
 *
 * Import this module BEFORE loading the ui.shared.browser.js bundle:
 *
 * ```js
 * require('@clerk/ui/register');
 * // Now load clerk-js which will load ui.shared.browser.js
 * ```
 *
 * This enables @clerk/ui to use the host app's React instead of bundling its own,
 * reducing the overall bundle size.
 */
'use strict';

const react = require('react');
const reactDom = require('react-dom');
const reactDomClient = require('react-dom/client');
const jsxRuntime = require('react/jsx-runtime');

// Only register if not already registered to avoid overwriting with potentially
// different React versions in complex module resolution scenarios.
if (globalThis.__clerkSharedModules) {
  // Warn if the already-registered React version differs from this import.
  // This could indicate multiple React versions in the bundle, which may cause issues.
  const existingVersion = globalThis.__clerkSharedModules.react?.version;
  if (existingVersion && existingVersion !== react.version) {
    console.warn(
      '[@clerk/ui/register] React version mismatch detected. ' +
        'Already registered: ' +
        existingVersion +
        ', current import: ' +
        react.version +
        '. ' +
        'This may cause issues with the shared @clerk/ui variant.',
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
