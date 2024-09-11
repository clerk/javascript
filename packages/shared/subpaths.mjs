// This file is a helper for the "subpath-workaround.mjs" script
// We have to polyfill our "exports" subpaths :cry:

export const subpathNames = [
  'browser',
  'callWithRetry',
  'color',
  'cookie',
  'date',
  'deprecated',
  'deriveState',
  'error',
  'file',
  'globs',
  'handleValueOrFn',
  'isomorphicAtob',
  'isomorphicBtoa',
  'keys',
  'loadClerkJsScript',
  'loadScript',
  'localStorageBroadcastChannel',
  'poller',
  'proxy',
  'underscore',
  'url',
  'versionSelector',
  'constants',
  'apiUrlFromPublishableKey',
  'telemetry',
  'logger',
  'webauthn',
  'router',
  'pathToRegexp',
];

export const subpathFoldersBarrel = ['react'];

export const ignoredFolders = ['scripts'];
