import { ClerkAPIResponseError } from '@clerk/shared/error';
import { act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { DeleteOrganizationForm } from '../ActionConfirmationPage';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('DeleteOrganizationPage', () => {
  it('deletes the organization after reverification when it is required', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', admin_delete_enabled: true }],
      });
    });

    const destroy = fixtures.clerk.organization!.destroy;
    destroy
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Reverification required', {
          status: 403,
          data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
        }),
      )
      .mockResolvedValueOnce(undefined);
    const openReverification = vi.spyOn(fixtures.clerk, '__internal_openReverification').mockImplementation(() => {});

    const { getByRole, userEvent, getByLabelText, findByRole } = render(
      <CardStateProvider>
        <DeleteOrganizationForm
          onSuccess={vi.fn()}
          onReset={vi.fn()}
        />
      </CardStateProvider>,
      { wrapper },
    );

    await userEvent.type(getByLabelText(/below to continue/i), 'Org1');
    await waitFor(async () => expect(await findByRole('button', { name: 'Delete organization' })).not.toBeDisabled());
    await userEvent.click(getByRole('button', { name: 'Delete organization' }));

    await waitFor(() => expect(openReverification).toHaveBeenCalledTimes(1));
    expect(destroy).toHaveBeenCalledTimes(1);

    await act(() => {
      openReverification.mock.calls[0][0]?.afterVerification?.();
    });

    await waitFor(() => expect(destroy).toHaveBeenCalledTimes(2));
  });
});
