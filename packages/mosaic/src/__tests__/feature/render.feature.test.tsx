import { describe, expect, it } from 'vitest';

import { serveFapi } from './fake-fapi';
import { fapiClient, fapiSession, fapiUser } from './fapi';
import { renderWithClerk } from './render';

describe('feature renderer cookie isolation', () => {
  it('loads an active session without leaving session cookies by default', async () => {
    const user = fapiUser({ id: 'user_1' });
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });

    const { clerk, unmount } = await renderWithClerk(<div />);

    expect(clerk.session?.id).toBe('sess_1');
    expect(await clerk.session?.getToken()).toEqual(expect.any(String));
    unmount();
    expect(document.cookie).not.toMatch(/(?:^|; )__session(?:_|=)/);
  });

  it('writes session cookies when standard browser behavior is requested', async () => {
    const user = fapiUser({ id: 'user_1' });
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });

    const { clerk } = await renderWithClerk(<div />, { standardBrowser: true });
    const token = await clerk.session?.getToken();

    expect(token).toEqual(expect.any(String));
    expect(document.cookie.split('; ')).toContain(`__session=${token}`);
  });
});
