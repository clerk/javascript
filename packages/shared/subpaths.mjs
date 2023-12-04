// This file is a helper for the "subpath-workaround.mjs" script
// We have to polyfill our "exports" subpaths :cry:

export const subpathNames = [
  'apiUrlFromPublishableKey',
  'browser',
  'callWithRetry',
  'color',
  'constants',
  'cookie',
  'date',
  'deprecated',
  'devBrowser',
  'error',
  'extensionSyncManager',
  'file',
  'globs',
  'handleValueOrFn',
  'isomorphicAtob',
  'isomorphicBtoa',
  'keys',
  'loadScript',
  'localStorageBroadcastChannel',
  'poller',
  'proxy',
  'telemetry',
  'underscore',
  'url',
];

export const subpathFoldersBarrel = ['react'];

export const ignoredFolders = ['scripts'];
