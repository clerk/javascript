import { ALTERNATIVE_PHONE_CODE_PROVIDERS } from '@clerk/shared/alternativePhoneCode';
import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import { WEB3_PROVIDERS } from '@clerk/shared/web3';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { enterpriseLogos, getEnterpriseLogo } from './enterprise.generated';
import { getOAuthLogo, oauthLogos } from './oauth.generated';
import { phoneLogos } from './phone.generated';
import { ProviderLogo } from './provider-logo';
import { web3Logos } from './web3.generated';

describe('Mosaic ProviderLogo', () => {
  it('renders the glyph and reflects its slot', () => {
    const { container } = render(<ProviderLogo glyph={oauthLogos.google} />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass('cl-provider-logo');
    expect(svg).toHaveAttribute('data-provider', 'google');
    expect(svg).toHaveAttribute('data-size', 'md');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('viewBox');
    expect(svg?.querySelector('path')).not.toBeNull();
  });

  it('paints monochrome logos with currentColor', () => {
    const { container } = render(<ProviderLogo glyph={oauthLogos.vercel} />);

    expect(container.querySelector('[fill="currentColor"]')).not.toBeNull();
  });

  it('paints adaptive logos with light-dark colors', () => {
    const { container } = render(<ProviderLogo glyph={oauthLogos.apple} />);

    expect(container.querySelector('path')?.getAttribute('style')).toContain('light-dark');
  });

  it('scopes internal ids to each instance', () => {
    const { container } = render(
      <>
        <ProviderLogo glyph={oauthLogos.google} />
        <ProviderLogo glyph={oauthLogos.google} />
      </>,
    );
    const ids = [...container.querySelectorAll('[id]')].map(node => node.id);

    expect(ids.length).toBeGreaterThan(1);
    expect(new Set(ids).size).toBe(ids.length);
    for (const node of container.querySelectorAll('[clip-path]')) {
      const ref = node.getAttribute('clip-path')?.match(/#([^)]+)/)?.[1];
      expect(ref && node.closest('svg')?.querySelector(`[id="${ref}"]`)).toBeTruthy();
    }
  });
});

describe('provider logo groups', () => {
  it('covers every OAuth, Web3, and phone provider Clerk supports', () => {
    expect(Object.keys(oauthLogos).sort()).toEqual(OAUTH_PROVIDERS.map(p => p.provider).sort());
    expect(Object.keys(web3Logos).sort()).toEqual(WEB3_PROVIDERS.map(p => p.provider).sort());
    expect(Object.keys(phoneLogos).sort()).toEqual(ALTERNATIVE_PHONE_CODE_PROVIDERS.map(p => p.channel).sort());
  });

  it('shares one glyph between groups', () => {
    expect(enterpriseLogos.saml_google).toBe(oauthLogos.google);
    expect(enterpriseLogos.oauth_microsoft).toBe(oauthLogos.microsoft);
  });

  it('looks up ids only within their own group', () => {
    expect(getEnterpriseLogo('saml_okta')?.id).toBe('okta');
    expect(getEnterpriseLogo('okta')).toBeUndefined();
    expect(getEnterpriseLogo('google')).toBeUndefined();
    expect(getOAuthLogo('saml_google')).toBeUndefined();
    expect(getOAuthLogo('custom_acme')).toBeUndefined();
  });
});
