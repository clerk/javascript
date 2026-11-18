import type { Web3Strategy } from '@clerk/shared/types';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../__tests__/async';
import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiEnvironment } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import type { SignInWithMetamaskButtonProps } from '../sign-in-with-metamask-button';
import { SignInWithMetamaskButton } from '../sign-in-with-metamask-button';

function serve(firstFactors: Web3Strategy[] = ['web3_metamask_signature']) {
  const base = fapiEnvironment();
  return serveFapi({
    environment: fapiEnvironment({
      user_settings: {
        attributes: {
          ...base.user_settings.attributes,
          web3_wallet: {
            ...base.user_settings.attributes.web3_wallet,
            enabled: true,
            used_for_first_factor: true,
            first_factors: firstFactors,
          },
        },
      },
    }),
  });
}

function tree(props: SignInWithMetamaskButtonProps = {}) {
  return (
    <div data-testid='host'>
      <SignInWithMetamaskButton {...props} />
    </div>
  );
}

const button = () => screen.findByRole('button', { name: 'Sign in with MetaMask' });

describe('SignInWithMetamaskButton', () => {
  it('renders its fallback while Clerk is still loading', async () => {
    serve();
    const client = holdRequests('get', '/v1/client');
    const rendering = renderWithClerk(tree({ fallback: <output data-testid='fallback'>Loading</output> }));

    await waitFor(() => expect(client.requests).toHaveLength(1));
    expect(screen.getByTestId('fallback')).toBeInTheDocument();

    client.release();
    await rendering;
    expect(screen.queryByTestId('fallback')).toBeNull();
    expect(await button()).toBeVisible();
  });

  it('renders nothing when MetaMask is not a sign-in strategy', async () => {
    serve(['web3_coinbase_wallet_signature']);
    await renderWithClerk(tree({ fallback: <output>Loading</output> }));

    expect(screen.getByTestId('host')).toBeEmptyDOMElement();
  });

  it('signs in with MetaMask and its redirect URL', async () => {
    serve();
    const { clerk } = await renderWithClerk(tree({ redirectUrl: '/dashboard' }));
    const authenticate = vi.spyOn(clerk, 'authenticateWithMetamask').mockResolvedValue(undefined);

    await userEvent.setup().click(await button());

    expect(authenticate).toHaveBeenCalledExactlyOnceWith({ redirectUrl: '/dashboard' });
  });

  it('holds the button while the wallet asks for a signature', async () => {
    serve();
    const { clerk } = await renderWithClerk(tree());
    const signature = deferred<undefined>();
    const authenticate = vi.spyOn(clerk, 'authenticateWithMetamask').mockReturnValue(signature.promise);
    const user = userEvent.setup();
    const trigger = await button();

    await user.click(trigger);
    await waitFor(() => expect(trigger).toBeDisabled());
    expect(trigger).toHaveAttribute('data-disabled');
    await user.click(trigger);
    expect(authenticate).toHaveBeenCalledTimes(1);

    signature.reject(new Error('User rejected the request.'));
    await waitFor(() => expect(trigger).toBeEnabled());
  });

  it('renders an unstyled native button', async () => {
    serve();
    await renderWithClerk(tree());

    const trigger = await button();
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).not.toHaveAttribute('class');
  });

  it('takes its label from children and its element from render', async () => {
    serve();
    const onClick = vi.fn();
    const { clerk } = await renderWithClerk(
      tree({
        render: <span data-testid='trigger' />,
        nativeButton: false,
        className: 'mine',
        children: 'Connect wallet',
        onClick,
      }),
    );
    const authenticate = vi.spyOn(clerk, 'authenticateWithMetamask').mockResolvedValue(undefined);

    const trigger = await screen.findByTestId('trigger');
    expect(trigger).toHaveAccessibleName('Connect wallet');
    expect(trigger).toHaveAttribute('role', 'button');
    expect(trigger).toHaveClass('mine');
    await userEvent.setup().click(trigger);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(authenticate).toHaveBeenCalledTimes(1);
  });
});
