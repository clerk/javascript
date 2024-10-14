import packageJson from './package.json' with { type: 'json' };

/**
 * This file is a helper for the "subpath-workaround.mjs" script.
 * Add your new subpath to package.json#files.
 *
 * When you add an entry to the package.json "files" field, a subfolder will be automatically created with a package.json pointing to that file
 */

export const subpathNames = packageJson.files.filter(k => k !== 'dist');

export const subpathFoldersBarrel = [];

export const ignoredFolders = [];
