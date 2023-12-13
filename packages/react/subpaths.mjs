import packageJson from './package.json' assert { type: 'json' };
// This file is a helper for the "subpath-workaround.mjs" script
// We have to polyfill our "exports" subpaths :cry:

export const subpathNames = Object.keys(packageJson.exports)
  .filter(k => k.startsWith('./') && k !== './' && k !== './package.json')
  .map(k => k.replace('./', ''));

export const subpathFoldersBarrel = [];

export const ignoredFolders = [];
