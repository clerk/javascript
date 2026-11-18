const fs = require('node:fs');
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const { dependencies, devDependencies } = require('./package.json');

const config = getDefaultConfig(__dirname);
const monorepoRoot = path.resolve(__dirname, '../../..');
const fixtureEntry = path.join(__dirname, 'index.js');
const fixturePackages = new Set(Object.keys({ ...dependencies, ...devDependencies }));

function linksToWorkspace() {
  try {
    return (
      fs.realpathSync(path.join(__dirname, 'node_modules/@clerk/expo')) === path.join(monorepoRoot, 'packages/expo')
    );
  } catch {
    return false;
  }
}

function packageName(moduleName) {
  const [scope, name] = moduleName.split('/');
  return scope.startsWith('@') ? `${scope}/${name}` : scope;
}

if (linksToWorkspace()) {
  config.watchFolders = [monorepoRoot];
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    const fromWorkspace = !context.originModulePath.startsWith(__dirname + path.sep);
    if (fromWorkspace && fixturePackages.has(packageName(moduleName))) {
      return context.resolveRequest({ ...context, originModulePath: fixtureEntry }, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
