import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UserProfileProviderMedia } from '../user-profile-provider-media';

describe('UserProfileProviderMedia', () => {
  it.each([
    ['an image logo', { iconUrl: 'https://img.clerk.com/static/okx_wallet.svg' }],
    ['a masked logo', { iconUrl: 'https://img.clerk.com/static/okx_wallet.svg', monochromeIcon: true }],
    ['the initial fallback', {}],
  ])('marks %s with the kebab-cased provider id', (_, props) => {
    const { container } = render(
      <UserProfileProviderMedia
        provider='OKX Wallet'
        iconId='okx_wallet'
        {...props}
      />,
    );

    expect(container.querySelector('.cl-provider-icon')).toHaveAttribute('data-provider', 'okx-wallet');
  });
});
