import { ClerkAPIResponseError } from '@clerk/shared/error';
import type * as SharedReact from '@clerk/shared/react';
import { createDeferredPromise } from '@clerk/shared/utils';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../mosaic-provider';
import { OrganizationProfileDangerSection } from '../organization-profile-danger-section/organization-profile-danger-section';

let isLoaded: boolean;
let hasOrganization: boolean;
let adminDeleteEnabled: boolean;
let canDelete: boolean;
let membersCount: number;
let leaveOrganization: ReturnType<typeof vi.fn>;
let destroy: ReturnType<typeof vi.fn>;
let navigate: ReturnType<typeof vi.fn>;
let revalidateMemberships: ReturnType<typeof vi.fn>;
let revalidateInvitations: ReturnType<typeof vi.fn>;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useOrganization: () => ({
      isLoaded,
      organization:
        isLoaded && hasOrganization ? { id: 'org_1', name: 'Clerk', membersCount, adminDeleteEnabled, destroy } : null,
      membership: isLoaded && hasOrganization ? { id: 'mem_1' } : null,
    }),
    useUser: () => ({ isLoaded, user: isLoaded ? { id: 'user_1', leaveOrganization } : undefined }),
    useSession: () => ({
      session: {
        checkAuthorization: ({ permission }: { permission: string }) =>
          canDelete && permission === 'org:sys_profile:delete',
      },
    }),
    useOrganizationList: () => ({
      userMemberships: { revalidate: revalidateMemberships },
      userInvitations: { revalidate: revalidateInvitations },
    }),
    useClerk: () => ({
      navigate,
      __internal_environment: { displayConfig: { afterLeaveOrganizationUrl: '/after-leave' } },
    }),
  };
});

function renderSection(props: React.ComponentProps<typeof OrganizationProfileDangerSection> = {}) {
  return render(
    <MosaicProvider>
      <OrganizationProfileDangerSection {...props} />
    </MosaicProvider>,
  );
}

async function openDialog(user: ReturnType<typeof userEvent.setup>, action: string) {
  await user.click(screen.getByRole('button', { name: action }));
  return screen.getByRole('dialog');
}

async function confirm(user: ReturnType<typeof userEvent.setup>, dialog: HTMLElement, action: string) {
  await user.type(within(dialog).getByRole('textbox'), 'Clerk');
  await user.click(within(dialog).getByRole('button', { name: action }));
}

describe('OrganizationProfileDangerSection', () => {
  beforeEach(() => {
    isLoaded = true;
    hasOrganization = true;
    adminDeleteEnabled = true;
    canDelete = true;
    membersCount = 20;
    leaveOrganization = vi.fn(() => Promise.resolve());
    destroy = vi.fn(() => Promise.resolve());
    navigate = vi.fn(() => Promise.resolve());
    revalidateMemberships = vi.fn();
    revalidateInvitations = vi.fn();
  });

  it('renders the fallback until the organization has loaded', () => {
    isLoaded = false;
    renderSection({ fallback: <p>Loading organization</p> });

    expect(screen.getByText('Loading organization')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Danger zone' })).not.toBeInTheDocument();
  });

  it('renders nothing without an active organization', () => {
    hasOrganization = false;
    const { container } = renderSection();

    expect(container).toBeEmptyDOMElement();
  });

  it('shows both actions to a member who can delete the organization', () => {
    renderSection();

    expect(screen.getByRole('heading', { name: 'Danger zone' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Leave organization' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete organization' })).toBeInTheDocument();
  });

  it('only offers leaving without the delete permission', () => {
    canDelete = false;
    renderSection();

    expect(screen.getByRole('button', { name: 'Leave organization' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete organization' })).not.toBeInTheDocument();
  });

  it('only offers leaving when the instance does not let admins delete organizations', () => {
    adminDeleteEnabled = false;
    renderSection();

    expect(screen.getByRole('button', { name: 'Leave organization' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete organization' })).not.toBeInTheDocument();
  });

  it('leaves only after the name is typed, then refreshes the lists and navigates away', async () => {
    const user = userEvent.setup();
    renderSection();
    const dialog = await openDialog(user, 'Leave organization');
    const action = within(dialog).getByRole('button', { name: 'Leave organization' });

    await user.type(within(dialog).getByRole('textbox'), 'Clerk Inc');
    await user.click(action);
    expect(leaveOrganization).not.toHaveBeenCalled();

    await user.clear(within(dialog).getByRole('textbox'));
    await confirm(user, dialog, 'Leave organization');

    await waitFor(() => expect(leaveOrganization).toHaveBeenCalledWith('org_1'));
    expect(revalidateMemberships).toHaveBeenCalled();
    expect(revalidateInvitations).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/after-leave');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('deletes the organization and navigates to the url the host passed', async () => {
    const user = userEvent.setup();
    renderSection({ afterLeaveOrganizationUrl: '/organizations' });
    const dialog = await openDialog(user, 'Delete organization');

    expect(dialog).toHaveTextContent(
      'Are you sure you want to delete Clerk? This removes 20 members and permanently deletes all organization data.',
    );
    await confirm(user, dialog, 'Delete organization');

    await waitFor(() => expect(destroy).toHaveBeenCalledOnce());
    expect(revalidateMemberships).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/organizations');
  });

  it('names a single remaining member in the delete warning', async () => {
    membersCount = 1;
    const user = userEvent.setup();
    renderSection();
    const dialog = await openDialog(user, 'Delete organization');

    expect(dialog).toHaveTextContent('This removes 1 member and permanently deletes all organization data.');
  });

  it('keeps the dialog up with the API error when leaving fails', async () => {
    leaveOrganization = vi.fn(() =>
      Promise.reject(
        new ClerkAPIResponseError('Forbidden', {
          status: 403,
          data: [
            {
              code: 'organization_minimum_permissions_needed',
              message: 'Short',
              long_message: 'There has to be at least one organization member with the minimum required permissions.',
            },
          ],
        }),
      ),
    );
    const user = userEvent.setup();
    renderSection();
    const dialog = await openDialog(user, 'Leave organization');

    await confirm(user, dialog, 'Leave organization');

    expect(
      await screen.findByText(
        'There has to be at least one organization member with the minimum required permissions.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('holds the dialog open while the delete is in flight', async () => {
    const pending = createDeferredPromise();
    destroy = vi.fn(() => pending.promise);
    const user = userEvent.setup();
    renderSection();
    const dialog = await openDialog(user, 'Delete organization');

    await confirm(user, dialog, 'Delete organization');

    expect(within(dialog).getByRole('button', { name: 'Delete organization' })).toHaveAttribute('aria-busy', 'true');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    pending.resolve();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
