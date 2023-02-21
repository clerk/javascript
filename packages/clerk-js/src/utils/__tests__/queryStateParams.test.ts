import { appendRedirectState } from '../queryStateParams';

describe('appendRedirectState function', () => {
  it('returns url with query param', () => {
    expect(
      appendRedirectState({
        url: 'https://accounts.helping.dory-0.dev.lclclerk.com/preview/default-redirect',
        componentName: 'UserProfile',
        socialProvider: 'github',
        modal: true,
      }),
    ).toEqual(
      'https://accounts.helping.dory-0.dev.lclclerk.com/preview/default-redirect?__clerk_redirect_state=eyJwYXRoIjoiIiwiY29tcG9uZW50TmFtZSI6IlVzZXJQcm9maWxlIiwic3RhcnRQYXRoIjoiL3VzZXIiLCJzb2NpYWxQcm92aWRlciI6ImdpdGh1YiIsIm1vZGFsIjp0cnVlfQ%3D%3D',
    );
  });

  it('returns proper decoded state', () => {
    expect(
      JSON.parse(
        atob(
          'eyJwYXRoIjoiIiwiY29tcG9uZW50TmFtZSI6IlVzZXJQcm9maWxlIiwic3RhcnRQYXRoIjoiL3VzZXIiLCJzb2NpYWxQcm92aWRlciI6ImdpdGh1YiIsIm1vZGFsIjp0cnVlfQ==',
        ),
      ),
    ).toEqual({ componentName: 'UserProfile', path: '', startPath: '/user', socialProvider: 'github', modal: true });
  });
});
