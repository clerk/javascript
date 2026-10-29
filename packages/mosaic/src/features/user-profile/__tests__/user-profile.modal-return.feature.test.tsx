import { configure, screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, onTestFinished } from 'vitest';
import { page } from 'vitest/browser';

import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiEnvironment, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { OrganizationSwitcher } from '../../organization-switcher/organization-switcher';
import { UserButton } from '../../user-button/user-button';

beforeAll(() => page.viewport(1280, 800));

function serve() {
  serveFapi({
    environment: fapiEnvironment(),
    client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ id: 'user_1' }) })]),
  });
}

function visit(search: string) {
  const original = window.location.href;
  window.history.replaceState(null, '', `${window.location.pathname}${search}#accounts`);
  onTestFinished(() => window.history.replaceState(null, '', original));
}

function strictMode() {
  configure({ reactStrictMode: true });
  onTestFinished(() => configure({ reactStrictMode: false }));
}

describe('UserProfile modal return', () => {
  it.each([
    { name: 'renders normally', strict: false },
    { name: 'renders in StrictMode', strict: true },
  ])('reopens the profile on the account page and clears the param when it $name', async ({ strict }) => {
    if (strict) {
      strictMode();
    }
    serve();
    visit('?__clerk_mosaic_modal=user-profile%2Faccount&__clerk_mosaic_opener=user-button&tab=connections');

    await renderWithClerk(<p>Page</p>);

    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(window.location.search).toBe('?tab=connections');
    expect(window.location.hash).toBe('#accounts');
  });

  it('reopens the profile with the pages its opener registered', async () => {
    serve();
    visit('?__clerk_mosaic_modal=user-profile%2Faccount');

    await renderWithClerk(
      <UserButton
        userProfileProps={{ customPages: [{ label: 'Terms', path: 'terms', content: <p>Terms body</p> }] }}
      />,
    );

    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByRole('tab', { name: 'Terms' })).toBeVisible();
    expect(within(dialog).getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
  });

  it('reopens the profile with the pages of the opener named in the return', async () => {
    serve();
    visit('?__clerk_mosaic_modal=user-profile%2Faccount&__clerk_mosaic_opener=user-button');

    await renderWithClerk(
      <>
        <UserButton
          userProfileProps={{ customPages: [{ label: 'Terms', path: 'terms', content: <p>Terms body</p> }] }}
        />
        <OrganizationSwitcher />
      </>,
    );

    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByRole('tab', { name: 'Terms' })).toBeVisible();
  });

  it('ignores an unknown value', async () => {
    serve();
    visit('?__clerk_mosaic_modal=organization-profile%2Fgeneral&__clerk_mosaic_opener=user-button&tab=connections');

    await renderWithClerk(<p>Page</p>);

    expect(await screen.findByText('Page')).toBeVisible();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(window.location.search).toBe(
      '?__clerk_mosaic_modal=organization-profile%2Fgeneral&__clerk_mosaic_opener=user-button&tab=connections',
    );
    expect(window.location.hash).toBe('#accounts');
  });
});
