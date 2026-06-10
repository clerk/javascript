const { existsSync } = require('node:fs');
const { join } = require('node:path');

const PLATFORM_PACKAGES = {
  'darwin-arm64': '@clerk/electron-passkeys-darwin-arm64',
  'darwin-x64': '@clerk/electron-passkeys-darwin-x64',
  'win32-arm64': '@clerk/electron-passkeys-win32-arm64-msvc',
  'win32-x64': '@clerk/electron-passkeys-win32-x64-msvc',
};

function loadNative() {
  const key = `${process.platform}-${process.arch}`;

  // Local napi builds land next to this file.
  const localBinary = join(__dirname, `electron-passkeys.${key}.node`);
  if (existsSync(localBinary)) {
    return require(localBinary);
  }

  const platformPackage = PLATFORM_PACKAGES[key];
  if (platformPackage) {
    try {
      return require(platformPackage);
    } catch {
      // Missing or unloadable optional package: report unsupported.
    }
  }
  return null;
}

const native = loadNative();

const notSupportedResult = () =>
  JSON.stringify({
    ok: false,
    error: { code: 'not_supported', message: 'Native passkeys are not supported on this platform.' },
  });

module.exports = {
  isAvailable() {
    return !!native && native.isAvailable();
  },
  capabilities() {
    if (!native || !native.isAvailable()) {
      return { platformAuthenticator: false, securityKeys: false };
    }
    return native.capabilities();
  },
  createCredential(windowHandle, optionsJson) {
    if (!native || !native.isAvailable()) {
      return Promise.resolve(notSupportedResult());
    }
    return native.createCredential(windowHandle, optionsJson);
  },
  getCredential(windowHandle, optionsJson) {
    if (!native || !native.isAvailable()) {
      return Promise.resolve(notSupportedResult());
    }
    return native.getCredential(windowHandle, optionsJson);
  },
};
