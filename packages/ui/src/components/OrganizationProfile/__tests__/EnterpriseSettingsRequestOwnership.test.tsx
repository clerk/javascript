import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { fireEvent } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, waitFor } from '@/test/utils';

import type { SSOConnection } from '../../ConfigureSSO/configure-sso.types';
import { SettingsSection } from '../EnterpriseConnectionPage/SettingsSection';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');
const connection: SSOConnection = {
  id: 'connection_first',
  name: 'First connection',
  provider: 'saml_okta',
  active: false,
  logoPublicUrl: null,
  domains: [],
  syncUserAttributes: false,
  disableAdditionalIdentifications: false,
  samlConnection: null,
  oauthConfig: null,
};
const rejected = () =>
  new ClerkAPIResponseError('Settings rejected', {
    status: 422,
    data: [{ code: 'form_param_format_invalid', message: 'Settings rejected', long_message: 'Settings rejected' }],
  });

async function setup(updateConnection = vi.fn().mockResolvedValue(undefined)) {
  const { wrapper } = await createFixtures(f => {
    f.withOrganizations();
    f.withUser({ email_addresses: ['first@clerk.com'] });
  });
  const view = (next = connection, family: 'saml' | 'oidc' = 'saml') => (
    <StrictMode>
      <SettingsSection
        connection={next}
        family={family}
        updateConnection={updateConnection}
      />
    </StrictMode>
  );
  return { ...render(view(), { wrapper }), view, updateConnection };
}

describe('Enterprise settings request ownership', () => {
  it('keeps one pending save through rerender and duplicate form submission', async () => {
    const deferred = createDeferredPromise<void>();
    const update = vi.fn(() => deferred.promise);
    const { getByRole, container, userEvent, rerender, view } = await setup(update);
    await userEvent.click(getByRole('checkbox', { name: /Sync user attributes/ }));
    const save = getByRole('button', { name: 'Save' });
    const form = container.querySelector('form')!;
    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    await waitFor(() => expect(update).toHaveBeenCalledOnce());
    expect(update).toHaveBeenCalledWith('connection_first', { syncUserAttributes: true });
    rerender(view());
    expect(save).toBeDisabled();
    fireEvent.submit(form);
    expect(update).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
    expect(save).toBeEnabled();
  });

  it.each(['success', 'failure'] as const)('keeps replacement form loading after an old %s', async outcome => {
    const first = createDeferredPromise<void>();
    const second = createDeferredPromise<void>();
    const update = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { getByRole, queryByText, userEvent, rerender, view } = await setup(update);
    await userEvent.click(getByRole('checkbox', { name: /Sync user attributes/ }));
    await userEvent.click(getByRole('button', { name: 'Save' }));
    rerender(view({ ...connection, id: 'connection_second' }));
    expect(getByRole('checkbox', { name: /Sync user attributes/ })).not.toBeChecked();
    await userEvent.click(getByRole('checkbox', { name: /Sync user attributes/ }));
    const save = getByRole('button', { name: 'Save' });
    await userEvent.click(save);
    expect(update).toHaveBeenLastCalledWith('connection_second', { syncUserAttributes: true });
    await act(async () => {
      if (outcome === 'success') {
        first.resolve();
      } else {
        first.reject(rejected());
      }
      await first.promise.catch(() => {});
    });
    expect(save).toBeDisabled();
    expect(queryByText('Settings rejected')).not.toBeInTheDocument();
    await act(async () => {
      second.resolve();
      await second.promise;
    });
    expect(save).toBeEnabled();
  });

  it('clears an old error when server settings change', async () => {
    const update = vi.fn().mockRejectedValueOnce(rejected());
    const { getByRole, findAllByText, queryByText, userEvent, rerender, view } = await setup(update);
    await userEvent.click(getByRole('checkbox', { name: /Sync user attributes/ }));
    await userEvent.click(getByRole('button', { name: 'Save' }));
    expect(await findAllByText('Settings rejected')).not.toHaveLength(0);
    rerender(view({ ...connection, syncUserAttributes: true }));
    expect(getByRole('checkbox', { name: /Sync user attributes/ })).toBeChecked();
    expect(queryByText('Settings rejected')).not.toBeInTheDocument();
    expect(getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('resets unsaved fields when the provider family changes', async () => {
    const { getByRole, queryByRole, userEvent, rerender, view, updateConnection } = await setup();
    await userEvent.click(getByRole('checkbox', { name: /Sync user attributes/ }));
    await userEvent.click(getByRole('checkbox', { name: /Allow subdomains/ }));
    rerender(view(connection, 'oidc'));
    expect(getByRole('checkbox', { name: /Sync user attributes/ })).not.toBeChecked();
    expect(queryByRole('checkbox', { name: /Allow subdomains/ })).not.toBeInTheDocument();
    expect(getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(updateConnection).not.toHaveBeenCalled();
  });

  it('allows retry after a synchronous failure and clears its old error', async () => {
    const update = vi
      .fn()
      .mockImplementationOnce(() => {
        throw rejected();
      })
      .mockResolvedValue(undefined);
    const { getByRole, findAllByText, queryByText, userEvent } = await setup(update);
    await userEvent.click(getByRole('checkbox', { name: /Sync user attributes/ }));
    const save = getByRole('button', { name: 'Save' });
    await userEvent.click(save);
    expect(await findAllByText('Settings rejected')).not.toHaveLength(0);
    expect(save).toBeEnabled();
    await userEvent.click(save);
    expect(update).toHaveBeenCalledTimes(2);
    expect(queryByText('Settings rejected')).not.toBeInTheDocument();
  });

  it('does not dispatch a queued save after the form closes', async () => {
    const { getByRole, userEvent, container, unmount, updateConnection } = await setup();
    await userEvent.click(getByRole('checkbox', { name: /Sync user attributes/ }));
    act(() => {
      fireEvent.submit(container.querySelector('form')!);
      unmount();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(updateConnection).not.toHaveBeenCalled();
  });
});
