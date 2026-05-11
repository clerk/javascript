import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

const goNext = vi.fn();
const goPrev = vi.fn();

vi.mock('../../elements/Wizard', () => ({
  useWizard: () => ({
    activeSteps: [],
    currentStep: undefined,
    currentIndex: -1,
    totalSteps: 0,
    isFirstStep: true,
    isLastStep: false,
    isNested: false,
    goNext,
    goPrev,
    goToStep: vi.fn(),
    registerStep: vi.fn(),
    unregisterStep: vi.fn(),
  }),
}));

import { SelectProviderStep } from '../SelectProviderStep';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');

describe('SelectProviderStep', () => {
  it('mounts and renders the step header', async () => {
    const { wrapper } = await createFixtures();
    render(<SelectProviderStep />, { wrapper });

    expect(screen.getByRole('heading', { name: 'Select provider' })).toBeInTheDocument();
    expect(screen.getByText('Select your identity provider')).toBeInTheDocument();
  });

  it('renders both SAML provider tiles with their labels', async () => {
    const { wrapper } = await createFixtures();
    render(<SelectProviderStep />, { wrapper });

    expect(screen.getByRole('button', { name: 'Okta Workforce' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom SAML Provider' })).toBeInTheDocument();
  });

  it('loads each tile icon from img.clerk.com', async () => {
    const { wrapper } = await createFixtures();
    const { container } = render(<SelectProviderStep />, { wrapper });

    // Emotion serializes sx into stylesheets, so we check both inline + the document's collected styles
    const iconSpans = Array.from(container.querySelectorAll('button span[aria-hidden]'));
    expect(iconSpans).toHaveLength(2);

    const collectedStyles = [
      ...Array.from(document.head.querySelectorAll('style')).map(s => s.textContent ?? ''),
      ...iconSpans.map(el => (el as HTMLElement).style.backgroundImage ?? ''),
    ].join('\n');

    expect(collectedStyles).toMatch(/img\.clerk\.com\/static\/okta\.svg/);
    expect(collectedStyles).toMatch(/img\.clerk\.com\/static\/saml\.svg/);
  });

  it('disables Continue when no provider is selected', async () => {
    const { wrapper } = await createFixtures();
    render(<SelectProviderStep />, { wrapper });

    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  it('marks the clicked tile as pressed and enables Continue', async () => {
    const { wrapper } = await createFixtures();
    const { userEvent } = render(<SelectProviderStep />, { wrapper });

    const oktaTile = screen.getByRole('button', { name: 'Okta Workforce' });
    expect(oktaTile).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(oktaTile);

    expect(oktaTile).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Continue/i })).toBeEnabled();
  });

  it('flips selection when a different tile is clicked', async () => {
    const { wrapper } = await createFixtures();
    const { userEvent } = render(<SelectProviderStep />, { wrapper });

    const oktaTile = screen.getByRole('button', { name: 'Okta Workforce' });
    const customSamlTile = screen.getByRole('button', { name: 'Custom SAML Provider' });

    await userEvent.click(oktaTile);
    expect(oktaTile).toHaveAttribute('aria-pressed', 'true');
    expect(customSamlTile).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(customSamlTile);
    expect(oktaTile).toHaveAttribute('aria-pressed', 'false');
    expect(customSamlTile).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls goNext when Continue is clicked after a selection', async () => {
    goNext.mockClear();
    const { wrapper } = await createFixtures();
    const { userEvent } = render(<SelectProviderStep />, { wrapper });

    await userEvent.click(screen.getByRole('button', { name: 'Okta Workforce' }));
    await userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    expect(goNext).toHaveBeenCalledTimes(1);
  });

  it('disables Previous on the first step', async () => {
    const { wrapper } = await createFixtures();
    render(<SelectProviderStep />, { wrapper });

    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
  });
});
