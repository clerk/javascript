'use strict';
exports.__esModule = true;
exports.sortedOAuthProviders = exports.getOAuthProviderData = exports.OAUTH_PROVIDERS = void 0;
exports.OAUTH_PROVIDERS = [
  {
    provider: 'google',
    strategy: 'oauth_google',
    name: 'Google',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-google',
  },
  {
    provider: 'discord',
    strategy: 'oauth_discord',
    name: 'Discord',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-discord',
  },
  {
    provider: 'facebook',
    strategy: 'oauth_facebook',
    name: 'Facebook',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-facebook',
  },
  {
    provider: 'twitch',
    strategy: 'oauth_twitch',
    name: 'Twitch',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-twitch',
  },
  {
    provider: 'twitter',
    strategy: 'oauth_twitter',
    name: 'Twitter',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-twitter',
  },
  {
    provider: 'microsoft',
    strategy: 'oauth_microsoft',
    name: 'Microsoft',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-microsoft',
  },
  {
    provider: 'tiktok',
    strategy: 'oauth_tiktok',
    name: 'TikTok',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-tiktok',
  },
  {
    provider: 'linkedin',
    strategy: 'oauth_linkedin',
    name: 'LinkedIn',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-linkedin',
  },
  {
    provider: 'github',
    strategy: 'oauth_github',
    name: 'GitHub',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-github',
  },
  {
    provider: 'gitlab',
    strategy: 'oauth_gitlab',
    name: 'GitLab',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-gitlab',
  },
  {
    provider: 'dropbox',
    strategy: 'oauth_dropbox',
    name: 'Dropbox',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-dropbox',
  },
  {
    provider: 'atlassian',
    strategy: 'oauth_atlassian',
    name: 'Atlassian',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-atlassian',
  },
  {
    provider: 'bitbucket',
    strategy: 'oauth_bitbucket',
    name: 'Bitbucket',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-bitbucket',
  },
  {
    provider: 'hubspot',
    strategy: 'oauth_hubspot',
    name: 'HubSpot',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-hubspot',
  },
  {
    provider: 'notion',
    strategy: 'oauth_notion',
    name: 'Notion',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-notion',
  },
  {
    provider: 'apple',
    strategy: 'oauth_apple',
    name: 'Apple',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-apple',
  },
  {
    provider: 'line',
    strategy: 'oauth_line',
    name: 'LINE',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-line',
  },
  {
    provider: 'instagram',
    strategy: 'oauth_instagram',
    name: 'Instagram',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-instagram',
  },
  {
    provider: 'coinbase',
    strategy: 'oauth_coinbase',
    name: 'Coinbase',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-coinbase',
  },
  {
    provider: 'spotify',
    strategy: 'oauth_spotify',
    name: 'Spotify',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-spotify',
  },
  {
    provider: 'xero',
    strategy: 'oauth_xero',
    name: 'Xero',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-xero',
  },
  {
    provider: 'box',
    strategy: 'oauth_box',
    name: 'Box',
    docsUrl: 'https://clerk.dev/docs/authentication/social-connection-with-box',
  },
];
function getOAuthProviderData(_a) {
  var provider = _a.provider,
    strategy = _a.strategy;
  if (provider) {
    return exports.OAUTH_PROVIDERS.find(function (oauth_provider) {
      return oauth_provider.provider == provider;
    });
  }
  return exports.OAUTH_PROVIDERS.find(function (oauth_provider) {
    return oauth_provider.strategy == strategy;
  });
}
exports.getOAuthProviderData = getOAuthProviderData;
function sortedOAuthProviders(sortingArray) {
  return exports.OAUTH_PROVIDERS.slice().sort(function (a, b) {
    var aPos = sortingArray.indexOf(a.strategy);
    if (aPos == -1) {
      aPos = Number.MAX_SAFE_INTEGER;
    }
    var bPos = sortingArray.indexOf(b.strategy);
    if (bPos == -1) {
      bPos = Number.MAX_SAFE_INTEGER;
    }
    return aPos - bPos;
  });
}
exports.sortedOAuthProviders = sortedOAuthProviders;
