#!/usr/bin/env zx

import 'zx/globals';

import fs from 'fs';

const loadJSON = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const writeJSON = (path, contents) =>
  fs.writeFileSync(new URL(path, import.meta.url), JSON.stringify(contents, null, 2));

const pkgJsonPlaceholder = name => ({
  main: `../dist/${name}.js`,
});
const pkgJsonBarrelPlaceholder = name => ({
  main: `../dist/${name}/index.js`,
});

async function run() {
  const pkgName = argv._[0];
  console.log(`Loading package.json for ${pkgName}`);
  const pkgFile = loadJSON(`../packages/${pkgName}/package.json`);
  const subpathHelperFile = await import(`../packages/${pkgName}/subpaths.mjs`);

  console.log(
    `Found ${subpathHelperFile.subpathNames.length} subpaths and ${subpathHelperFile.subpathFoldersBarrel.length} subpath barrels`,
  );

  // Check if pkgFile.files already contains the subpaths. This means that the script has already been run and we should exit early
  const subpathsAlreadyAdded = subpathHelperFile.subpathNames.some(name => pkgFile.files.includes(name));

  if (subpathsAlreadyAdded) {
    return console.log(`Subpaths already added to ${pkgName} package.json. Exiting early`);
  }

  // Add all subpaths to the "files" property on package.json
  pkgFile.files = [...pkgFile.files, ...subpathHelperFile.subpathNames, ...subpathHelperFile.subpathFoldersBarrel];

  writeJSON(`../packages/${pkgName}/package.json`, pkgFile);

  console.log(`Overwrote package.json for ${pkgName} with subpaths`);

  // Create directories for each subpath name using the pkgJsonPlaceholder
  subpathHelperFile.subpathNames.forEach(name => {
    fs.mkdirSync(new URL(`../packages/${pkgName}/${name}`, import.meta.url));
    writeJSON(`../packages/${pkgName}/${name}/package.json`, pkgJsonPlaceholder(name));
  });

  // Create directories for each subpath barrel file using the pkgJsonBarrelPlaceholder
  subpathHelperFile.subpathFoldersBarrel.forEach(name => {
    fs.mkdirSync(new URL(`../packages/${pkgName}/${name}`, import.meta.url));
    writeJSON(`../packages/${pkgName}/${name}/package.json`, pkgJsonBarrelPlaceholder(name));
  });

  console.log('Successfully created subpath directories with placeholder files');
}

await run();
