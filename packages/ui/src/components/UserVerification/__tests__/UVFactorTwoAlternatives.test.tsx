import type { SessionVerificationSecondFactor } from '@clerk/shared/types';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { fireEvent, render } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { UVFactorTwoAlternativeMethods } from '../UVFactorTwoAlternativeMethods';

const { createFixtures } = bindCreateFixtures('UserVerification');
const factors: SessionVerificationSecondFactor[] = [{ strategy: 'backup_code' }, { strategy: 'totp' }];
const CardControls = () => {
  const card = useCardState();
  return (
    <button
      type='button'
      onClick={() => card.setLoading()}
    >
      Mark busy
    </button>
  );
};
const setup = async (supportedSecondFactors: SessionVerificationSecondFactor[] | null) => {
  const { wrapper: Fixture } = await createFixtures();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  const onFactorSelected = vi.fn();
  const onBackLinkClick = vi.fn();
  const rendered = render(
    <>
      <CardControls />
      <UVFactorTwoAlternativeMethods
        supportedSecondFactors={supportedSecondFactors}
        onFactorSelected={onFactorSelected}
        onBackLinkClick={onBackLinkClick}
      />
    </>,
    { wrapper },
  );
  return { ...rendered, onFactorSelected, onBackLinkClick };
};

describe('Second-factor alternatives', () => {
  it('sorts a frozen factor list without changing the source order', async () => {
    const frozen = Object.freeze([...factors]) as unknown as SessionVerificationSecondFactor[];
    const { getAllByRole, getByRole, userEvent, onFactorSelected } = await setup(frozen);
    const methods = getAllByRole('button').filter(button => /authenticator|backup/i.test(button.textContent || ''));
    expect(methods.map(button => button.textContent)).toEqual(['Use your authenticator app', 'Use a backup code']);
    expect(frozen.map(factor => factor.strategy)).toEqual(['backup_code', 'totp']);
    await userEvent.click(getByRole('button', { name: /authenticator app/i }));
    expect(onFactorSelected).toHaveBeenCalledExactlyOnceWith(frozen[1]);
  });

  it('disables method selection while the card is busy and keeps the back callback', async () => {
    const { getByRole, getByText, userEvent, onFactorSelected, onBackLinkClick } = await setup(factors);
    await userEvent.click(getByRole('button', { name: 'Mark busy' }));
    const method = getByRole('button', { name: /authenticator app/i });
    expect(method).toBeDisabled();
    fireEvent.click(method);
    expect(onFactorSelected).not.toHaveBeenCalled();
    await userEvent.click(getByText('Back'));
    expect(onBackLinkClick).toHaveBeenCalledTimes(1);
  });

  it('renders a null list without factor buttons', async () => {
    const { queryByRole } = await setup(null);
    expect(queryByRole('button', { name: /authenticator|backup/i })).not.toBeInTheDocument();
  });
});
