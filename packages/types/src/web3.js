'use strict';
exports.__esModule = true;
exports.getWeb3ProviderData = exports.WEB3_PROVIDERS = void 0;
exports.WEB3_PROVIDERS = [
  {
    provider: 'metamask',
    strategy: 'web3_metamask_signature',
    name: 'MetaMask',
  },
];
function getWeb3ProviderData(_a) {
  var provider = _a.provider,
    strategy = _a.strategy;
  if (provider) {
    return exports.WEB3_PROVIDERS.find(function (p) {
      return p.provider == provider;
    });
  }
  return exports.WEB3_PROVIDERS.find(function (p) {
    return p.strategy == strategy;
  });
}
exports.getWeb3ProviderData = getWeb3ProviderData;
