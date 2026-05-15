import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppearanceProvider } from '@/ui/customizables';
import { InternalThemeProvider } from '@/ui/styledSystem';

import { bindCreateFixtures } from '@/test/create-fixtures';

import { ApplicationLogo } from '../ApplicationLogo';

const { createFixtures } = bindCreateFixtures('SignIn');

const ENV_LIGHT_LOGO = 'https://images.clerk.com/uploaded/img_logo.png';
const ENV_DARK_LOGO = 'https://images.clerk.com/uploaded/img_logo_dark.png';
const OPTIONS_LIGHT_LOGO = 'https://example.com/options-light-logo.png';
const OPTIONS_DARK_LOGO = 'https://example.com/options-dark-logo.png';
const PROP_SRC = 'https://example.com/prop-logo.png';

const mockColorScheme = vi.fn(() => 'normal');
const originalGetComputedStyle = window.getComputedStyle;
const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  window.getComputedStyle = vi.fn((el: Element) => {
    const real = originalGetComputedStyle(el);
    return new Proxy(real, {
      get(target, prop) {
        if (prop === 'colorScheme') {
          return mockColorScheme();
        }
        return Reflect.get(target, prop);
      },
    });
  }) as typeof window.getComputedStyle;

  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(() => {
  window.getComputedStyle = originalGetComputedStyle;
  window.matchMedia = originalMatchMedia;
  mockColorScheme.mockReturnValue('normal');
});

function withAppearanceOptions(
  FixtureWrapper: React.ComponentType<{ children: ReactNode }>,
  options: Record<string, string>,
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <FixtureWrapper>
        <AppearanceProvider
          appearanceKey='signIn'
          appearance={{ options }}
        >
          <InternalThemeProvider>{children}</InternalThemeProvider>
        </AppearanceProvider>
      </FixtureWrapper>
    );
  };
}

const getLogoSrc = () => screen.getByAltText('TestApp').getAttribute('src');

describe('ApplicationLogo', () => {
  describe('no dark logo configured', () => {
    it('renders environment light logo', async () => {
      const { wrapper } = await createFixtures();
      render(<ApplicationLogo />, { wrapper });
      expect(getLogoSrc()).toBe(ENV_LIGHT_LOGO);
    });

    it('renders src prop over environment logo', async () => {
      const { wrapper } = await createFixtures();
      render(<ApplicationLogo src={PROP_SRC} />, { wrapper });
      expect(getLogoSrc()).toBe(PROP_SRC);
    });

    it('shows light logo even when color-scheme is dark', async () => {
      mockColorScheme.mockReturnValue('dark');
      const { wrapper } = await createFixtures();
      render(<ApplicationLogo />, { wrapper });
      expect(getLogoSrc()).toBe(ENV_LIGHT_LOGO);
    });

    it('returns null when no logo URL exists', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withDisplayConfig({ logo_image_url: '' });
      });
      const { container } = render(<ApplicationLogo />, { wrapper });
      expect(container.innerHTML).toBe('');
    });
  });

  describe('dark logo from environment', () => {
    const withDarkLogo = (f: Parameters<Parameters<typeof createFixtures>[0]>[0]) => {
      f.withDisplayConfig({ dark_logo_image_url: ENV_DARK_LOGO });
    };

    it('renders light logo when color-scheme is normal (not set)', async () => {
      mockColorScheme.mockReturnValue('normal');
      const { wrapper } = await createFixtures(withDarkLogo);
      render(<ApplicationLogo />, { wrapper });
      expect(getLogoSrc()).toBe(ENV_LIGHT_LOGO);
    });

    it('renders light logo when color-scheme is "light"', async () => {
      mockColorScheme.mockReturnValue('light');
      const { wrapper } = await createFixtures(withDarkLogo);
      render(<ApplicationLogo />, { wrapper });
      expect(getLogoSrc()).toBe(ENV_LIGHT_LOGO);
    });

    it('renders dark logo when color-scheme is "dark"', async () => {
      mockColorScheme.mockReturnValue('dark');
      const { wrapper } = await createFixtures(withDarkLogo);
      render(<ApplicationLogo />, { wrapper });
      expect(getLogoSrc()).toBe(ENV_DARK_LOGO);
    });

    it('renders light logo when color-scheme is "light dark" and system prefers light', async () => {
      mockColorScheme.mockReturnValue('light dark');
      const { wrapper } = await createFixtures(withDarkLogo);
      render(<ApplicationLogo />, { wrapper });
      expect(getLogoSrc()).toBe(ENV_LIGHT_LOGO);
    });

    it('renders dark logo when color-scheme is "light dark" and system prefers dark', async () => {
      mockColorScheme.mockReturnValue('light dark');
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      const { wrapper } = await createFixtures(withDarkLogo);
      render(<ApplicationLogo />, { wrapper });
      expect(getLogoSrc()).toBe(ENV_DARK_LOGO);
    });

    it('renders dark logo when color-scheme is "dark light"', async () => {
      mockColorScheme.mockReturnValue('dark light');
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      const { wrapper } = await createFixtures(withDarkLogo);
      render(<ApplicationLogo />, { wrapper });
      expect(getLogoSrc()).toBe(ENV_DARK_LOGO);
    });
  });

  describe('options.darkLogoImageUrl', () => {
    it('uses options.darkLogoImageUrl in dark mode', async () => {
      mockColorScheme.mockReturnValue('dark');
      const { wrapper } = await createFixtures();
      const wrappedWrapper = withAppearanceOptions(wrapper, { darkLogoImageUrl: OPTIONS_DARK_LOGO });
      render(<ApplicationLogo />, { wrapper: wrappedWrapper });
      expect(getLogoSrc()).toBe(OPTIONS_DARK_LOGO);
    });

    it('uses environment light logo in light mode even when options.darkLogoImageUrl is set', async () => {
      mockColorScheme.mockReturnValue('normal');
      const { wrapper } = await createFixtures();
      const wrappedWrapper = withAppearanceOptions(wrapper, { darkLogoImageUrl: OPTIONS_DARK_LOGO });
      render(<ApplicationLogo />, { wrapper: wrappedWrapper });
      expect(getLogoSrc()).toBe(ENV_LIGHT_LOGO);
    });

    it('options.darkLogoImageUrl takes priority over environment dark logo', async () => {
      mockColorScheme.mockReturnValue('dark');
      const { wrapper } = await createFixtures(f => {
        f.withDisplayConfig({ dark_logo_image_url: ENV_DARK_LOGO });
      });
      const wrappedWrapper = withAppearanceOptions(wrapper, { darkLogoImageUrl: OPTIONS_DARK_LOGO });
      render(<ApplicationLogo />, { wrapper: wrappedWrapper });
      expect(getLogoSrc()).toBe(OPTIONS_DARK_LOGO);
    });
  });

  describe('backwards compat — options.logoImageUrl disables auto-switching', () => {
    it('uses options.logoImageUrl and ignores environment dark logo in dark mode', async () => {
      mockColorScheme.mockReturnValue('dark');
      const { wrapper } = await createFixtures(f => {
        f.withDisplayConfig({ dark_logo_image_url: ENV_DARK_LOGO });
      });
      const wrappedWrapper = withAppearanceOptions(wrapper, { logoImageUrl: OPTIONS_LIGHT_LOGO });
      render(<ApplicationLogo />, { wrapper: wrappedWrapper });
      expect(getLogoSrc()).toBe(OPTIONS_LIGHT_LOGO);
    });

    it('uses options.logoImageUrl and ignores options.darkLogoImageUrl in dark mode', async () => {
      mockColorScheme.mockReturnValue('dark');
      const { wrapper } = await createFixtures();
      const wrappedWrapper = withAppearanceOptions(wrapper, {
        logoImageUrl: OPTIONS_LIGHT_LOGO,
        darkLogoImageUrl: OPTIONS_DARK_LOGO,
      });
      render(<ApplicationLogo />, { wrapper: wrappedWrapper });
      expect(getLogoSrc()).toBe(OPTIONS_LIGHT_LOGO);
    });

    it('src prop always wins over everything in dark mode', async () => {
      mockColorScheme.mockReturnValue('dark');
      const { wrapper } = await createFixtures(f => {
        f.withDisplayConfig({ dark_logo_image_url: ENV_DARK_LOGO });
      });
      const wrappedWrapper = withAppearanceOptions(wrapper, { darkLogoImageUrl: OPTIONS_DARK_LOGO });
      render(<ApplicationLogo src={PROP_SRC} />, { wrapper: wrappedWrapper });
      expect(getLogoSrc()).toBe(PROP_SRC);
    });
  });
});
