import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

import { deferred } from '../../../../__tests__/async';
import { serveFapi } from '../../../../__tests__/feature/fake-fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileWeb3WalletsSection } from '../user-profile-web3-wallets-section';
import { signedInWallets } from './user-profile-web3-wallets.fixtures';

it('handles cancellation in MetaMask without offering a Clerk cancel button and allows a fresh connection', async () => {
  const accounts = deferred<string[]>();
  const request = vi.fn(({ method }: { method: string }) =>
    method === 'personal_sign' ? Promise.resolve('signature') : accounts.promise,
  );
  vi.stubGlobal('ethereum', { request });
  const fapi = serveFapi(signedInWallets(['web3_metamask_signature', 'web3_solana_signature']));
  await renderWithClerk(<UserProfileWeb3WalletsSection />);
  const user = userEvent.setup();

  await user.click(await screen.findByRole('button', { name: 'Connect MetaMask' }));
  await waitFor(() => expect(request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' }));
  expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByRole('button', { name: 'Connect Solana' })).toBeDisabled();
  expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  await act(() => accounts.reject({ code: 4001, message: 'User rejected the request.' }));

  expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Connect Solana' })).toBeEnabled();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(0);
  expect(request).not.toHaveBeenCalledWith(expect.objectContaining({ method: 'personal_sign' }));

  request.mockImplementation(({ method }) =>
    Promise.resolve(method === 'personal_sign' ? 'signature' : ['0xabcdef1234567890']),
  );
  await user.click(screen.getByRole('button', { name: 'Connect MetaMask' }));
  await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'));
  expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(1);
  expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.web3_wallet).toBe('0xabcdef1234567890');
});

it('releases a rejected MetaMask connection without displaying an error', async () => {
  const request = vi.fn().mockRejectedValue({ code: 4001, message: 'User rejected the request.' });
  vi.stubGlobal('ethereum', { request });
  serveFapi(signedInWallets(['web3_metamask_signature']));
  await renderWithClerk(<UserProfileWeb3WalletsSection />);
  await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect MetaMask' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toBeEnabled());
  expect(screen.queryByText('Something went wrong. Please try again.')).not.toBeInTheDocument();
});

it('explains that an existing MetaMask request needs attention in the wallet', async () => {
  vi.stubGlobal('ethereum', { request: vi.fn().mockRejectedValue({ code: -32002 }) });
  serveFapi(signedInWallets(['web3_metamask_signature']));
  await renderWithClerk(<UserProfileWeb3WalletsSection />);
  await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect MetaMask' }));
  expect(
    await screen.findByText(
      'A request is already pending in your wallet. Open your wallet to complete or reject it, then try again.',
    ),
  ).toBeVisible();
});

it.each(['resolve', 'reject'] as const)(
  'ignores a late provider %s after closing and reopening the section',
  async outcome => {
    const old = deferred<string[]>();
    const next = deferred<string[]>();
    const request = vi.fn(({ method }: { method: string }) =>
      method === 'personal_sign' ? Promise.resolve('signature') : old.promise,
    );
    vi.stubGlobal('ethereum', { request });
    const fapi = serveFapi(signedInWallets(['web3_metamask_signature']));
    const view = await renderWithClerk(<UserProfileWeb3WalletsSection />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Connect MetaMask' }));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    view.rerender(<div />);
    view.rerender(<UserProfileWeb3WalletsSection />);
    request.mockImplementation(({ method }) =>
      method === 'personal_sign' ? Promise.resolve('signature') : next.promise,
    );
    await user.click(await screen.findByRole('button', { name: 'Connect MetaMask' }));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    await act(() => {
      if (outcome === 'resolve') {
        old.resolve(['0xold']);
      } else {
        old.reject({ code: -32002 });
      }
    });
    expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(0);
    await act(() => next.resolve(['0xnew']));
    await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'));
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(1);
    expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.web3_wallet).toBe('0xnew');
  },
);
