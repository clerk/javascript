import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { CardStateProvider } from '../../../elements/contexts';
import { clearFetchCache, useFetch } from '../../../hooks';
import { localizationKeys } from '../../../localization';
import { SignInFactorOneForgotPasswordCard } from '../SignInFactorOneForgotPasswordCard';

const { createFixtures } = bindCreateFixtures('SignIn');

vi.mock('../../../hooks', async () => {
  const actual = await vi.importActual('../../../hooks');
  return {
    ...actual,
    useFetch: vi.fn(),
  };
});

describe('SignInFactorOneForgotPasswordCard', () => {
  beforeEach(() => {
    clearFetchCache();
    vi.mocked(useFetch).mockClear();
  });

  const renderCard = async (localization?: { backButton: string }) => {
    const onBackLinkClicked = vi.fn();
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.startSignInWithEmailAddress({ supportEmailCode: true });
    });

    if (localization) {
      fixtures.options.localization = localization;
    }

    const view = render(
      <CardStateProvider>
        <SignInFactorOneForgotPasswordCard
          factor={{
            strategy: 'reset_password_email_code',
            emailAddressId: 'idn_456',
            safeIdentifier: 'j***@example.com',
          }}
          factorAlreadyPrepared={false}
          onFactorPrepare={vi.fn()}
          cardSubtitle={localizationKeys('signIn.forgotPassword.subtitle_email')}
          onBackLinkClicked={onBackLinkClicked}
        />
      </CardStateProvider>,
      { wrapper },
    );

    return { ...view, onBackLinkClicked };
  };

  it('renders a Back button with an accessible name', async () => {
    const { userEvent, onBackLinkClicked } = await renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(onBackLinkClicked).toHaveBeenCalledOnce();
  });

  it('localizes the back button label', async () => {
    await renderCard({ backButton: 'Volver' });

    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
  });
});
