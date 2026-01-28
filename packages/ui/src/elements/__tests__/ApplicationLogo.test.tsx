import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/utils';

import { ApplicationLogo } from '../ApplicationLogo';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('ApplicationLogo', () => {
  describe('Default behavior', () => {
    it('renders logo with imageSrc from displayConfig', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withDisplayConfig({
          logo_image_url: 'https://example.com/logo.png',
          application_name: 'Test App',
        });
      });

      render(<ApplicationLogo />, { wrapper });

      const img = screen.getByAltText('Test App');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/logo.png');
    });

    it('returns null when no imageSrc is available', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withDisplayConfig({
          logo_image_url: '',
          application_name: 'Test App',
        });
      });

      const { container } = render(<ApplicationLogo />, { wrapper });
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Render prop - element form', () => {
    it('renders custom logo component when renderLogoImage is provided as element', async () => {
      const CustomLogo = () => <div data-testid='custom-logo'>Custom Logo</div>;

      const { wrapper } = await createFixtures(f => {
        f.withAppearance({
          options: {
            renderLogoImage: <CustomLogo />,
          },
        });
      });

      render(<ApplicationLogo />, { wrapper });

      expect(screen.getByTestId('custom-logo')).toBeInTheDocument();
      expect(screen.getByText('Custom Logo')).toBeInTheDocument();
    });
  });

  describe('Render prop - callback form', () => {
    it('renders logo with callback function receiving props', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withDisplayConfig({
          logo_image_url: 'https://example.com/logo.png',
          application_name: 'Test App',
        });
        f.withAppearance({
          options: {
            renderLogoImage: props => (
              <img
                {...props}
                data-testid='custom-rendered-logo'
                src='/custom-logo.png'
              />
            ),
          },
        });
      });

      render(<ApplicationLogo />, { wrapper });

      const img = screen.getByTestId('custom-rendered-logo');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/custom-logo.png');
      expect(img).toHaveAttribute('alt', 'Test App');
    });

    it('handles light/dark mode with picture element', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withDisplayConfig({
          logo_image_url: 'https://example.com/logo.png',
          application_name: 'Test App',
        });
        f.withAppearance({
          options: {
            renderLogoImage: props => (
              <picture>
                <source
                  srcSet='/logo-dark.svg'
                  media='(prefers-color-scheme: dark)'
                />
                <img
                  {...props}
                  data-testid='theme-aware-logo'
                  src='/logo-light.svg'
                />
              </picture>
            ),
          },
        });
      });

      render(<ApplicationLogo />, { wrapper });

      const picture = screen.getByTestId('theme-aware-logo').closest('picture');
      expect(picture).toBeInTheDocument();
      const source = picture?.querySelector('source');
      expect(source).toHaveAttribute('srcSet', '/logo-dark.svg');
      expect(source).toHaveAttribute('media', '(prefers-color-scheme: dark)');
    });

    it('merges props correctly when using callback form', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withDisplayConfig({
          logo_image_url: 'https://example.com/logo.png',
          application_name: 'Test App',
        });
        f.withAppearance({
          options: {
            renderLogoImage: props => (
              <img
                {...props}
                data-testid='merged-props-logo'
                className='custom-class'
              />
            ),
          },
        });
      });

      render(<ApplicationLogo />, { wrapper });

      const img = screen.getByTestId('merged-props-logo');
      expect(img).toHaveAttribute('alt', 'Test App');
      expect(img).toHaveClass('custom-class');
    });
  });

  describe('Priority handling', () => {
    it('prefers renderLogoImage over logoImageUrl', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withDisplayConfig({
          logo_image_url: 'https://example.com/logo.png',
          application_name: 'Test App',
        });
        f.withAppearance({
          options: {
            logoImageUrl: 'https://example.com/override.png',
            renderLogoImage: props => (
              <img
                {...props}
                data-testid='render-prop-logo'
                src='/render-prop-logo.png'
              />
            ),
          },
        });
      });

      render(<ApplicationLogo />, { wrapper });

      const img = screen.getByTestId('render-prop-logo');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/render-prop-logo.png');
    });
  });
});
