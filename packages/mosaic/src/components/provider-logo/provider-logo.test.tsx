import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { isProviderLogoId, ProviderLogo } from './provider-logo';

describe('Mosaic ProviderLogo', () => {
  it('renders the glyph and reflects its slot', () => {
    const { container } = render(<ProviderLogo provider='google' />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass('cl-provider-logo');
    expect(svg).toHaveAttribute('data-provider', 'google');
    expect(svg).toHaveAttribute('data-size', 'md');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('viewBox');
    expect(svg?.querySelector('path')).not.toBeNull();
  });

  it('paints monochrome logos with currentColor', () => {
    const { container } = render(<ProviderLogo provider='vercel' />);

    expect(container.querySelector('[fill="currentColor"]')).not.toBeNull();
  });

  it('paints adaptive logos with light-dark colors', () => {
    const { container } = render(<ProviderLogo provider='apple' />);

    expect(container.querySelector('path')?.getAttribute('style')).toContain('light-dark');
  });

  it('scopes internal ids to each instance', () => {
    const { container } = render(
      <>
        <ProviderLogo provider='google' />
        <ProviderLogo provider='google' />
      </>,
    );
    const ids = [...container.querySelectorAll('[id]')].map(node => node.id);

    expect(ids.length).toBeGreaterThan(1);
    expect(new Set(ids).size).toBe(ids.length);
    for (const node of container.querySelectorAll('[clip-path]')) {
      const ref = node.getAttribute('clip-path')!.match(/#([^)]+)/)![1];
      expect(node.closest('svg')!.querySelector(`[id="${ref}"]`)).not.toBeNull();
    }
  });

  it('narrows provider strings', () => {
    expect(isProviderLogoId('google')).toBe(true);
    expect(isProviderLogoId('oauth_custom_acme')).toBe(false);
  });
});
