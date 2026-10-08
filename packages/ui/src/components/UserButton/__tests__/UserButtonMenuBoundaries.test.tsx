import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, waitFor } from '@/test/utils';

import { UserButton } from '..';

const { createFixtures } = bindCreateFixtures('UserButton');
async function setup() {
  const { wrapper, fixtures, props } = await createFixtures(f => {
    f.withUser({ first_name: 'First', last_name: 'User', email_addresses: ['first@clerk.com'] });
  });
  props.setProps({
    customMenuItems: [{ label: 'Account report', href: '/report', mountIcon: () => {}, unmountIcon: () => {} }],
  });
  return { ...render(<UserButton />, { wrapper }), fixtures };
}

describe('UserButton menu boundaries', () => {
  it('updates the trigger and menu from the current user after rendering', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ first_name: 'First', last_name: 'User', email_addresses: ['first@clerk.com'] });
    });
    props.setProps({ showName: true });
    const { getByText, getByRole, queryByText, rerender, userEvent } = render(<UserButton />, { wrapper });
    expect(getByText('First User')).toBeVisible();
    const updated = { ...fixtures.clerk.user!, firstName: 'Updated' };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(updated);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      user: updated,
    };
    rerender(<UserButton />);
    expect(queryByText('First User')).not.toBeInTheDocument();
    expect(getByText('Updated User')).toBeVisible();
    await userEvent.click(getByRole('button', { name: 'Open user menu' }));
    expect(getByRole('dialog', { name: 'Account panel' })).toHaveTextContent('Updated User');
  });

  it('closes the source after custom navigation completes', async () => {
    const { getByRole, userEvent, fixtures, queryByRole } = await setup();
    await userEvent.click(getByRole('button', { name: 'Open user menu' }));
    await userEvent.click(getByRole('button', { name: 'Account report' }));
    expect(fixtures.router.navigate).toHaveBeenCalledWith('/report');
    await waitFor(() => {
      expect(queryByRole('dialog', { name: 'Account panel' })).not.toBeInTheDocument();
    });
  });

  it('keeps the new menu and its loading state when old navigation finishes', async () => {
    const { getByRole, userEvent, fixtures } = await setup();
    const first = createDeferredPromise<boolean>();
    const second = createDeferredPromise<boolean>();
    fixtures.router.navigate.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    await userEvent.click(getByRole('button', { name: 'Open user menu' }));
    await userEvent.click(getByRole('button', { name: 'Account report' }));
    await waitFor(() => expect(fixtures.router.navigate).toHaveBeenCalledTimes(1));
    await userEvent.keyboard('{Escape}');
    await userEvent.click(getByRole('button', { name: 'Open user menu' }));
    await userEvent.click(getByRole('button', { name: 'Account report' }));
    await waitFor(() => expect(fixtures.router.navigate).toHaveBeenCalledTimes(2));
    await act(async () => {
      first.resolve(true);
      await first.promise;
    });
    expect(getByRole('dialog', { name: 'Account panel' })).toBeVisible();
    expect(getByRole('button', { name: 'Sign out' })).toBeDisabled();
    await act(async () => {
      second.resolve(true);
      await second.promise;
    });
  });

  it('rejects custom navigation when the active account changes before rendering', async () => {
    const { getByRole, userEvent, fixtures } = await setup();
    await userEvent.click(getByRole('button', { name: 'Open user menu' }));
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_changed' });
    await userEvent.click(getByRole('button', { name: 'Account report' }));
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });

  it('preserves the initial open state and closes after an action', async () => {
    const { wrapper, props, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['first@clerk.com'] });
    });
    props.setProps({ defaultOpen: true });
    const { getByRole, queryByRole, userEvent } = render(<UserButton />, { wrapper });
    expect(getByRole('dialog', { name: 'Account panel' })).toBeVisible();
    await userEvent.click(getByRole('button', { name: 'Manage account' }));
    expect(fixtures.clerk.openUserProfile).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(queryByRole('dialog', { name: 'Account panel' })).not.toBeInTheDocument();
    });
  });

  it('hides the popover when the session becomes unavailable and restores it on return', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['first@clerk.com'] });
    });
    props.setProps({ __experimental_asStandalone: true });
    const { getByRole, queryByRole, rerender } = render(<UserButton />, { wrapper });
    expect(getByRole('dialog', { name: 'Account panel' })).toBeVisible();
    const session = fixtures.clerk.session;
    const sessionGetter = vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(null);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      session: null,
    };
    rerender(<UserButton />);
    expect(queryByRole('dialog', { name: 'Account panel' })).not.toBeInTheDocument();
    sessionGetter.mockReturnValue(session);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources, session };
    rerender(<UserButton />);
    expect(getByRole('dialog', { name: 'Account panel' })).toBeVisible();
  });
});
