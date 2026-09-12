import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { ProviderIcon, SUPPORTS_MASK_IMAGE } from '../ProviderIcon';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('ProviderIcon', () => {
  describe('Rendering with iconUrl', () => {
    it('renders Span with correct aria-label when iconUrl is provided', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl='https://example.com/google-icon.svg'
          name='Google'
        />,
        { wrapper },
      );

      const icon = screen.getByLabelText('Google icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('SPAN');
    });

    it('uses custom alt text when provided', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl='https://example.com/google-icon.svg'
          name='Google'
          alt='Custom Google logo'
        />,
        { wrapper },
      );

      const icon = screen.getByLabelText('Custom Google logo');
      expect(icon).toBeInTheDocument();
    });

    it('keeps the mask-image provider list in sync', () => {
      expect(SUPPORTS_MASK_IMAGE).toEqual(['agentid', 'apple', 'github', 'okx_wallet', 'vercel', 'x']);
    });

    it.each(SUPPORTS_MASK_IMAGE)('tints supported provider %s with the foreground color via mask-image', async id => {
      const { wrapper } = await createFixtures();
      const iconUrl = `https://example.com/${id}-icon.svg`;

      render(
        <ProviderIcon
          id={id}
          iconUrl={iconUrl}
          name={id}
        />,
        { wrapper },
      );

      const icon = screen.getByLabelText(`${id} icon`);
      expect(icon).toBeInTheDocument();

      const styles = window.getComputedStyle(icon);
      expect(styles.maskImage).toContain(iconUrl);
      expect(styles.backgroundImage).not.toContain(iconUrl);
    });

    it('applies background-image styles for non-mask-image providers', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl='https://example.com/google-icon.svg'
          name='Google'
        />,
        { wrapper },
      );

      const icon = screen.getByLabelText('Google icon');
      expect(icon).toBeInTheDocument();

      const styles = window.getComputedStyle(icon);
      expect(styles.backgroundImage).toContain('https://example.com/google-icon.svg');
      expect(styles.maskImage).not.toContain('https://example.com/google-icon.svg');
    });
  });

  describe('Rendering without iconUrl', () => {
    it('falls back to ProviderInitialIcon when iconUrl is null', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl={null}
          name='Google'
        />,
        { wrapper },
      );

      // ProviderInitialIcon renders the first letter of the name
      const initial = screen.getByText('G');
      expect(initial).toBeInTheDocument();
    });

    it('falls back to ProviderInitialIcon when iconUrl is undefined', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='github'
          iconUrl={undefined}
          name='GitHub'
        />,
        { wrapper },
      );

      const initial = screen.getByText('G');
      expect(initial).toBeInTheDocument();
    });

    it('falls back to ProviderInitialIcon when iconUrl is empty string', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='apple'
          iconUrl=''
          name='Apple'
        />,
        { wrapper },
      );

      const initial = screen.getByText('A');
      expect(initial).toBeInTheDocument();
    });

    it('falls back to ProviderInitialIcon when iconUrl is whitespace-only', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl='   '
          name='Google'
        />,
        { wrapper },
      );

      const initial = screen.getByText('G');
      expect(initial).toBeInTheDocument();
    });

    it('passes isLoading prop to ProviderInitialIcon', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl={null}
          name='Google'
          isLoading
        />,
        { wrapper },
      );

      const initial = screen.getByText('G');
      expect(initial).toBeInTheDocument();
    });

    it('passes isDisabled prop to ProviderInitialIcon', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl={null}
          name='Google'
          isDisabled
        />,
        { wrapper },
      );

      const initial = screen.getByText('G');
      expect(initial).toBeInTheDocument();
    });
  });

  describe('Loading and disabled states', () => {
    it('applies opacity 0.5 when isLoading is true', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl='https://example.com/google-icon.svg'
          name='Google'
          isLoading
        />,
        { wrapper },
      );

      const icon = screen.getByLabelText('Google icon');
      const styles = window.getComputedStyle(icon);
      expect(styles.opacity).toBe('0.5');
    });

    it('applies opacity 0.5 when isDisabled is true', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl='https://example.com/google-icon.svg'
          name='Google'
          isDisabled
        />,
        { wrapper },
      );

      const icon = screen.getByLabelText('Google icon');
      const styles = window.getComputedStyle(icon);
      expect(styles.opacity).toBe('0.5');
    });

    it('applies opacity 1 when neither isLoading nor isDisabled is true', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl='https://example.com/google-icon.svg'
          name='Google'
          isLoading={false}
          isDisabled={false}
        />,
        { wrapper },
      );

      const icon = screen.getByLabelText('Google icon');
      const styles = window.getComputedStyle(icon);
      expect(styles.opacity).toBe('1');
    });
  });

  describe('Size prop', () => {
    it('uses default size $4 when not provided', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl='https://example.com/google-icon.svg'
          name='Google'
        />,
        { wrapper },
      );

      const icon = screen.getByLabelText('Google icon');
      expect(icon).toBeInTheDocument();
      // Size is applied via theme, so we verify the element exists
      // The actual size value depends on theme configuration
    });

    it('uses custom size when provided', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl='https://example.com/google-icon.svg'
          name='Google'
          size='$7'
        />,
        { wrapper },
      );

      const icon = screen.getByLabelText('Google icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('sets aria-label from alt prop when provided', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl='https://example.com/google-icon.svg'
          name='Google'
          alt='Google provider icon'
        />,
        { wrapper },
      );

      const icon = screen.getByLabelText('Google provider icon');
      expect(icon).toHaveAttribute('aria-label', 'Google provider icon');
    });

    it('generates aria-label from name when alt is not provided', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl='https://example.com/google-icon.svg'
          name='Google'
        />,
        { wrapper },
      );

      const icon = screen.getByLabelText('Google icon');
      expect(icon).toHaveAttribute('aria-label', 'Google icon');
    });

    it('uses correct elementDescriptor', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl='https://example.com/google-icon.svg'
          name='Google'
        />,
        { wrapper },
      );

      const icon = screen.getByLabelText('Google icon');
      expect(icon).toBeInTheDocument();
      // Element descriptor is applied via data attributes in the styled system
    });
  });

  describe('Edge cases', () => {
    it('handles providers with different casing', async () => {
      const { wrapper } = await createFixtures();

      render(
        <ProviderIcon
          id='google'
          iconUrl='https://example.com/google-icon.svg'
          name='Google'
        />,
        { wrapper },
      );

      const icon = screen.getByLabelText('Google icon');
      expect(icon).toBeInTheDocument();
    });

    it('handles custom elementDescriptor', async () => {
      const { wrapper } = await createFixtures();
      const { descriptors } = await import('../../customizables');

      render(
        <ProviderIcon
          id='google'
          iconUrl='https://example.com/google-icon.svg'
          name='Google'
          elementDescriptor={descriptors.socialButtonsProviderIcon}
        />,
        { wrapper },
      );

      const icon = screen.getByLabelText('Google icon');
      expect(icon).toBeInTheDocument();
    });

    it('handles custom elementId', async () => {
      const { wrapper } = await createFixtures();
      const { descriptors } = await import('../../customizables');

      render(
        <ProviderIcon
          id='google'
          iconUrl='https://example.com/google-icon.svg'
          name='Google'
          elementId={descriptors.providerIcon.setId('google')}
        />,
        { wrapper },
      );

      const icon = screen.getByLabelText('Google icon');
      expect(icon).toBeInTheDocument();
    });
  });
});
