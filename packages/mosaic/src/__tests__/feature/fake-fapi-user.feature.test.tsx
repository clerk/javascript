import { describe, expect, it, onTestFinished, vi } from 'vitest';

import { fapiUrl, serveFapi, verifyEmailOutOfBand } from './fake-fapi';
import { fapiClient, fapiEmailAddress, fapiSession, fapiUser, fapiVerification, fapiWeb3Wallet } from './fapi';

describe('fake FAPI user updates', () => {
  it('updates profile fields without clearing omitted identification fields', async () => {
    const user = fapiUser({
      id: 'user_1',
      first_name: 'Austin',
      last_name: 'Original',
      username: 'austin',
      primary_web3_wallet_id: 'wallet_1',
      web3_wallets: [fapiWeb3Wallet({ id: 'wallet_1', web3_wallet: '0x1234' })],
    });
    const fapi = serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });

    const response = await fetch(`${fapiUrl('/v1/me')}?_method=PATCH`, {
      method: 'POST',
      body: new URLSearchParams({ first_name: 'Updated', last_name: 'Name', username: 'updated' }),
    });

    expect(response.ok).toBe(true);
    expect(fapi.client.sessions[0]?.user).toMatchObject({
      first_name: 'Updated',
      last_name: 'Name',
      username: 'updated',
      primary_web3_wallet_id: 'wallet_1',
      web3_wallets: user.web3_wallets,
    });
  });

  it('keeps a user change made while a session touch is in flight', async () => {
    const user = fapiUser({
      id: 'user_1',
      email_addresses: [fapiEmailAddress({ id: 'idn_1', verification: fapiVerification('email_link') })],
    });
    const fapi = serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
    const readBody = Request.prototype.text;
    const text = vi.spyOn(Request.prototype, 'text').mockImplementation(function (this: Request) {
      verifyEmailOutOfBand(fapi, 'idn_1');
      return readBody.call(this);
    });
    onTestFinished(() => text.mockRestore());

    const response = await fetch(fapiUrl('/v1/client/sessions/sess_1/touch'), {
      method: 'POST',
      body: new URLSearchParams({ active_organization_id: '' }),
    });

    expect(response.ok).toBe(true);
    expect(fapi.client.sessions[0]?.user.email_addresses[0]?.verification?.status).toBe('verified');
  });
});
