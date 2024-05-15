// This file is a helper for the "subpath-workaround.mjs" script
// We have to polyfill our "exports" subpaths :cry:

export const subpathNames = [
  'browser',
  'callWithRetry',
  'color',
  'cookie',
  'date',
  'deprecated',
  'error',
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
  'underscore',
  'url',
  'constants',
  'apiUrlFromPublishableKey',
  'telemetry',
  'logger',
];

export const subpathFoldersBarrel = ['react'];

export const ignoredFolders = ['scripts'];
