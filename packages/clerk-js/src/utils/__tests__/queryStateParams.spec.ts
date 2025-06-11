import { describe, expect, it } from 'vitest';

import { appendModalState } from '../queryStateParams';

describe('appendModalState function', () => {
  it('returns url with query param', () => {
    expect(
      appendModalState({
        url: 'https://accounts.helping.dory-0.dev.lclclerk.com/preview/default-redirect',
        componentName: 'UserProfile',
        socialProvider: 'github',
      }),
    ).toEqual(
      'https://accounts.helping.dory-0.dev.lclclerk.com/preview/default-redirect?__clerk_modal_state=eyJwYXRoIjoiIiwiY29tcG9uZW50TmFtZSI6IlVzZXJQcm9maWxlIiwic3RhcnRQYXRoIjoiL3VzZXIiLCJzb2NpYWxQcm92aWRlciI6ImdpdGh1YiJ9',
    );
  });

  it('returns proper decoded state', () => {
    expect(
      JSON.parse(
        atob(
          'eyJwYXRoIjoiIiwiY29tcG9uZW50TmFtZSI6IlVzZXJQcm9maWxlIiwic3RhcnRQYXRoIjoiL3VzZXIiLCJzb2NpYWxQcm92aWRlciI6ImdpdGh1YiJ9',
        ),
      ),
    ).toEqual({ componentName: 'UserProfile', path: '', startPath: '/user', socialProvider: 'github' });
  });
});
