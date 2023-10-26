#!/usr/bin/env zx

import 'zx/globals';

import fs from 'fs';

const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const writeJSON = (path, contents) => fs.writeFileSync(new URL(path, import.meta.url), JSON.stringify(contents, null, 2));

const pkgName = argv._[0]
console.log(`Loading package.json for ${pkgName}`)
const pkgFile = loadJSON(`../packages/${pkgName}/package.json`)
const subpathHelperFile = await import(`../packages/${pkgName}/subpaths.mjs`)

const pkgJsonPlaceholder = (name) => ({
  main: `../dist/${name}.js`
})
const pkgJsonBarrelPlaceholder = (name) => ({
  main: `../dist/${name}/index.js`
})

// Add all subpaths to the "files" property on package.json

pkgFile.files = [...pkgFile.files, ...subpathHelperFile.subpathNames, ...subpathHelperFile.subpathFoldersBarrel]

console.log(`Found ${subpathHelperFile.subpathNames.length} subpaths and ${subpathHelperFile.subpathFoldersBarrel.length} subpath barrels`)

// Create directories for each subpath name using the pkgJsonPlaceholder
subpathHelperFile.subpathNames.forEach((name) => {
  fs.mkdirSync(new URL(`../packages/${pkgName}/${name}`, import.meta.url))
  writeJSON(`../packages/${pkgName}/${name}/package.json`, pkgJsonPlaceholder(name))
})

// Create directories for each subpath barrel file using the pkgJsonBarrelPlaceholder
subpathHelperFile.subpathFoldersBarrel.forEach((name) => {
  fs.mkdirSync(new URL(`../packages/${pkgName}/${name}`, import.meta.url))
  writeJSON(`../packages/${pkgName}/${name}/package.json`, pkgJsonBarrelPlaceholder(name))
})

console.log('Successfully created subpath directories and package.json file override')