import { describe, expect, it } from 'vitest';

import { fapiUrl, serveFapi } from './fake-fapi';
import { fapiClient, fapiSession, fapiUser, fapiWeb3Wallet } from './fapi';

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
});
