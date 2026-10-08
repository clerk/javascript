import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';
import { useSignInFactorOneSolanaWalletsCardModel } from '@/ui/components/SignIn/sign-in-factor-one-solana-wallets-card.model';
import { useSignUpStartSolanaWalletsCardModel } from '@/ui/components/SignUp/sign-up-start-solana-wallets-card.model';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { useSolanaWalletController } from '../solana-wallet.controller';

const factories = {
  SignIn: bindCreateFixtures('SignIn').createFixtures,
  SignUp: bindCreateFixtures('SignUp').createFixtures,
};
const CardBoundary = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);
const failure = () =>
  new ClerkAPIResponseError('Wallet failed', {
    status: 422,
    data: [{ code: 'oauth_access_denied', message: 'Wallet failed' }],
  });

describe.each(['SignIn', 'SignUp'] as const)('%s Solana wallet ownership', flow => {
  async function setup() {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost:3000/',
        origin: 'http://localhost:3000',
      },
    });
    const fixtures = await factories[flow]();
    fixtures.props.setProps({ forceRedirectUrl: 'http://localhost:3000/' });
    const FixtureWrapper = fixtures.wrapper;
    const Wrapper = ({ children }: PropsWithChildren) => (
      <FixtureWrapper>
        <CardBoundary>{children}</CardBoundary>
      </FixtureWrapper>
    );
    const useModel =
      flow === 'SignIn' ? useSignInFactorOneSolanaWalletsCardModel : useSignUpStartSolanaWalletsCardModel;
    const sdk = vi.spyOn(fixtures.fixtures.clerk, 'authenticateWithWeb3').mockResolvedValue(undefined);
    const hook = renderHook(
      () => {
        const model = useModel();
        const controller = useSolanaWalletController(model);
        const card = useCardState();
        return { model, controller, card };
      },
      { wrapper: Wrapper },
    );
    return { ...fixtures, ...hook, sdk };
  }

  it.each(['user', 'session', 'organization', 'client'] as const)(
    'rejects retained actions after %s changes',
    async field => {
      const { result, fixtures, sdk } = await setup();
      const old = result.current;
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field], id: 'other' } as never);
      await act(async () => {
        await old.controller.onWeb3Auth({ walletName: 'Phantom' });
        old.controller.onBackLinkClick();
        await old.model.authenticate('Phantom');
        await old.model.navigateBack();
      });
      expect(sdk).not.toHaveBeenCalled();
      expect(fixtures.router.navigate).not.toHaveBeenCalled();
    },
  );

  it('uses the existing route options and discards the SDK return value', async () => {
    const { result, sdk } = await setup();
    sdk.mockResolvedValueOnce({ privateResponse: true } as never);
    await expect(result.current.model.authenticate('Phantom')).resolves.toBeUndefined();
    expect(sdk).toHaveBeenCalledWith(
      expect.objectContaining({
        strategy: 'web3_solana_signature',
        walletName: 'Phantom',
        ...(flow === 'SignIn'
          ? { secondFactorUrl: '../factor-two', protectCheckUrl: '../protect-check' }
          : { signUpContinueUrl: 'continue' }),
      }),
    );
  });

  it('presents an active failure and allows retry', async () => {
    const { result, sdk } = await setup();
    sdk.mockRejectedValueOnce(failure());
    await act(async () => {
      await result.current.controller.onWeb3Auth({ walletName: 'Phantom' });
    });
    expect(result.current.card.error).toBe('You did not grant access to your account.');
    await act(async () => {
      await result.current.controller.onWeb3Auth({ walletName: 'Phantom' });
    });
    expect(sdk).toHaveBeenCalledTimes(2);
  });

  it('does not replace a shared error when a disposed request fails', async () => {
    const { result, sdk, unmount } = await setup();
    const deferred = createDeferredPromise<void>();
    sdk.mockReturnValueOnce(deferred.promise);
    const old = result.current;
    const setError = vi.spyOn(old.card, 'setError');
    const request = old.controller.onWeb3Auth({ walletName: 'Phantom' });
    unmount();
    await act(async () => {
      deferred.reject(failure());
      await request;
    });
    expect(setError).not.toHaveBeenCalled();
  });

  it('rejects old callbacks after a redirect target changes and returns', async () => {
    const { result, sdk, props, rerender, fixtures } = await setup();
    const deferred = createDeferredPromise<void>();
    sdk.mockReturnValueOnce(deferred.promise);
    const old = result.current;
    const request = old.controller.onWeb3Auth({ walletName: 'Phantom' });
    const oldNavigate = sdk.mock.calls[0][0].customNavigate!;
    props.setProps({ forceRedirectUrl: 'http://localhost:3000/other' });
    rerender();
    props.setProps({ forceRedirectUrl: 'http://localhost:3000/' });
    rerender();
    await act(async () => {
      await oldNavigate('../factor-two');
      deferred.reject(failure());
      await request;
      await old.controller.onWeb3Auth({ walletName: 'Backpack' });
      old.controller.onBackLinkClick();
    });
    expect(sdk).toHaveBeenCalledOnce();
    expect(result.current.card.error).toBeUndefined();
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });

  it('allows intermediate navigation only while the original source is active', async () => {
    const { result, sdk, fixtures, unmount } = await setup();
    await result.current.model.authenticate('Phantom');
    const navigate = sdk.mock.calls[0][0].customNavigate!;
    await navigate('../protect-check');
    expect(fixtures.router.navigate).toHaveBeenCalledWith('../protect-check');
    unmount();
    await navigate('../factor-two');
    expect(fixtures.router.navigate).toHaveBeenCalledOnce();
  });

  it('suppresses pending errors after canonical account drift before rendering', async () => {
    const { result, sdk, fixtures } = await setup();
    const deferred = createDeferredPromise<void>();
    sdk.mockReturnValueOnce(deferred.promise);
    const request = result.current.controller.onWeb3Auth({ walletName: 'Phantom' });
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ id: 'other' } as never);
    await act(async () => {
      deferred.reject(failure());
      await request;
    });
    expect(result.current.card.error).toBeUndefined();
  });
});
