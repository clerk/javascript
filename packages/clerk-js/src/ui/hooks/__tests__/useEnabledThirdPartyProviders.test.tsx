import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '../../../test/utils';
import { useEnabledThirdPartyProviders } from '../useEnabledThirdPartyProviders';

const { createFixtures } = bindCreateFixtures('SignUp');

describe('useEnabledThirdPartyProviders', () => {
  it('should returns correct strategies', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withSocialProvider({ provider: 'apple' });
      f.withSocialProvider({ provider: 'facebook' });
    });
    const { result } = renderHook(() => useEnabledThirdPartyProviders(), { wrapper });

    const { authenticatableOauthStrategies } = result.current;

    expect(authenticatableOauthStrategies).toStrictEqual(['oauth_apple', 'oauth_facebook']);
  });

  it('should returns correct sorting for all default strategies', async () => {
    const { wrapper } = await createFixtures(f => {
      OAUTH_PROVIDERS.map(p => f.withSocialProvider({ provider: p.provider }));
    });
    const { result } = renderHook(() => useEnabledThirdPartyProviders(), { wrapper });

    const { authenticatableOauthStrategies } = result.current;

    expect(authenticatableOauthStrategies).toStrictEqual([
      'oauth_apple',
      'oauth_atlassian',
      'oauth_bitbucket',
      'oauth_box',
      'oauth_coinbase',
      'oauth_discord',
      'oauth_dropbox',
      'oauth_enstall',
      'oauth_facebook',
      'oauth_github',
      'oauth_gitlab',
      'oauth_google',
      'oauth_hubspot',
      'oauth_huggingface',
      'oauth_instagram',
      'oauth_line',
      'oauth_linear',
      'oauth_linkedin',
      'oauth_linkedin_oidc',
      'oauth_microsoft',
      'oauth_notion',
      'oauth_slack',
      'oauth_spotify',
      'oauth_tiktok',
      'oauth_twitch',
      'oauth_twitter',
      'oauth_vercel',
      'oauth_x',
      'oauth_xero',
    ]);
  });

  it('should returns correct custom strategies', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withSocialProvider({ provider: 'custom_google' });
      f.withSocialProvider({ provider: 'custom_acme' });
    });
    const { result } = renderHook(() => useEnabledThirdPartyProviders(), { wrapper });

    const { authenticatableOauthStrategies } = result.current;

    expect(authenticatableOauthStrategies).toStrictEqual(['oauth_custom_acme', 'oauth_custom_google']);
  });

  it('should returns correct default and custom strategies', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withSocialProvider({ provider: 'apple' });
      f.withSocialProvider({ provider: 'facebook' });
      f.withSocialProvider({ provider: 'custom_google' });
    });
    const { result } = renderHook(() => useEnabledThirdPartyProviders(), { wrapper });

    const { authenticatableOauthStrategies } = result.current;

    expect(authenticatableOauthStrategies).toStrictEqual(['oauth_apple', 'oauth_facebook', 'oauth_custom_google']);
  });

  it('should returns sorted default and custom strategies correctly', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withSocialProvider({ provider: 'custom_google' });
      f.withSocialProvider({ provider: 'apple' });
      f.withSocialProvider({ provider: 'facebook' });
    });
    const { result } = renderHook(() => useEnabledThirdPartyProviders(), { wrapper });

    const { authenticatableOauthStrategies } = result.current;

    expect(authenticatableOauthStrategies).toStrictEqual(['oauth_apple', 'oauth_facebook', 'oauth_custom_google']);
  });

  it('should returns sorted default and custom strategies correctly', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withSocialProvider({ provider: 'custom_google' });
      f.withSocialProvider({ provider: 'custom_patreon' });
      f.withSocialProvider({ provider: 'apple' });
      f.withSocialProvider({ provider: 'facebook' });
      f.withSocialProvider({ provider: 'microsoft' });
      f.withSocialProvider({ provider: 'slack' });
    });
    const { result } = renderHook(() => useEnabledThirdPartyProviders(), { wrapper });

    const { authenticatableOauthStrategies } = result.current;

    expect(authenticatableOauthStrategies).toStrictEqual([
      'oauth_apple',
      'oauth_facebook',
      'oauth_custom_google',
      'oauth_microsoft',
      'oauth_custom_patreon',
      'oauth_slack',
    ]);
  });
});
