import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationProfileDomainsSectionController } from '../organization-profile-domains-section.controller';

let isLoaded: boolean;
let isSessionLoaded: boolean;
let organization: {
  id: string;
  getDomain: ReturnType<typeof vi.fn>;
  createDomain: ReturnType<typeof vi.fn>;
} | null;
let domainsEnabled: boolean;
let canRead: boolean;
let canManage: boolean;
let enrollmentModes: string[];
let getDomain: ReturnType<typeof vi.fn>;
let createDomain: ReturnType<typeof vi.fn>;
let deleteDomain: ReturnType<typeof vi.fn>;
let updateEnrollmentMode: ReturnType<typeof vi.fn>;
let revalidate: ReturnType<typeof vi.fn>;
let domains: {
  data: Array<{ id: string; name: string }>;
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNext: ReturnType<typeof vi.fn>;
  revalidate: ReturnType<typeof vi.fn>;
} | null;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof import('@clerk/shared/react')>();
  return {
    ...actual,
    useOrganization: () => ({ isLoaded, organization, domains }),
    useSession: () => ({
      isLoaded: isSessionLoaded,
      session: isSessionLoaded
        ? {
            id: 'sess_1',
            checkAuthorization: ({ permission }: { permission: string }) =>
              permission === 'org:sys_domains:manage'
                ? canManage
                : permission === 'org:sys_domains:read'
                  ? canRead
                  : false,
          }
        : undefined,
    }),
    useClerk: () => ({
      __internal_environment: { organizationSettings: { domains: { enabled: domainsEnabled, enrollmentModes } } },
    }),
  };
});

beforeEach(() => {
  isLoaded = true;
  isSessionLoaded = true;
  domainsEnabled = true;
  canRead = true;
  canManage = true;
  enrollmentModes = ['manual_invitation', 'automatic_invitation', 'automatic_suggestion'];
  deleteDomain = vi.fn().mockResolvedValue(undefined);
  updateEnrollmentMode = vi.fn().mockResolvedValue(undefined);
  getDomain = vi.fn().mockResolvedValue({ delete: deleteDomain, updateEnrollmentMode });
  createDomain = vi.fn().mockResolvedValue({ id: 'dmn_new', name: 'new.com', verification: { status: 'unverified' } });
  revalidate = vi.fn().mockResolvedValue(undefined);
  organization = { id: 'org_1', getDomain, createDomain };
  domains = {
    data: [{ id: 'dmn_1', name: 'clerk.com' }],
    isLoading: false,
    hasNextPage: false,
    fetchNext: vi.fn(),
    revalidate,
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const controller = useOrganizationProfileDomainsSectionController();
  if (controller.status !== 'ready') {
    return <output data-testid='state'>{controller.status}</output>;
  }
  return (
    <div>
      <output data-testid='state'>ready</output>
      <output data-testid='can-manage'>{String(controller.canManage)}</output>
      <output data-testid='count'>{controller.list.data.length}</output>
      <output data-testid='remove-state'>{controller.remove.snapshot.value}</output>
      <output data-testid='enrollment-state'>{controller.enrollment.snapshot.value}</output>
      <output data-testid='add-verify-state'>{controller.addVerify.snapshot.value}</output>
      <output data-testid='enrollment-options'>{controller.enrollmentOptions.map(o => o.value).join(',')}</output>
      <button onClick={() => controller.list.fetchNext()}>Fetch next</button>
      <button onClick={() => controller.remove.send({ type: 'OPEN', domain: { id: 'dmn_1', name: 'clerk.com' } })}>
        Open remove
      </button>
      <button onClick={() => controller.remove.send({ type: 'CONFIRM' })}>Confirm remove</button>
      <button
        onClick={() =>
          controller.enrollment.send({
            type: 'OPEN',
            domain: {
              id: 'dmn_1',
              name: 'clerk.com',
              enrollmentMode: 'manual_invitation',
              totalPendingInvitations: 0,
              totalPendingSuggestions: 0,
            },
          })
        }
      >
        Open enrollment
      </button>
      <button onClick={() => controller.enrollment.send({ type: 'SELECT_MODE', value: 'automatic_invitation' })}>
        Select mode
      </button>
      <button onClick={() => controller.enrollment.send({ type: 'SUBMIT' })}>Submit enrollment</button>
      <button onClick={() => controller.addVerify.send({ type: 'OPEN_ADD' })}>Open add</button>
      <button onClick={() => controller.addVerify.send({ type: 'TYPE_NAME', value: 'new.com' })}>Type name</button>
      <button onClick={() => controller.addVerify.send({ type: 'SUBMIT_NAME' })}>Submit name</button>
    </div>
  );
}

describe('useOrganizationProfileDomainsSectionController', () => {
  it('is loading until the organization is loaded', () => {
    isLoaded = false;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is loading until the session is loaded', () => {
    isSessionLoaded = false;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is hidden when domains are disabled for the instance', () => {
    domainsEnabled = false;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('is hidden when the user cannot read domains', () => {
    canRead = false;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('is hidden when the user cannot manage and there are no domains', () => {
    canManage = false;
    domains = { data: [], isLoading: false, hasNextPage: false, fetchNext: vi.fn(), revalidate };
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('is loading when the user cannot manage and the first page is still loading', () => {
    canManage = false;
    domains = { data: [], isLoading: true, hasNextPage: false, fetchNext: vi.fn(), revalidate };
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is ready for a manager even when there are no domains yet', () => {
    domains = { data: [], isLoading: false, hasNextPage: false, fetchNext: vi.fn(), revalidate };
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('ready');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('exposes the domain list and manage flag when ready', () => {
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('ready');
    expect(screen.getByTestId('can-manage')).toHaveTextContent('true');
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('forwards fetchNext to the paginated resource', () => {
    const fetchNext = vi.fn();
    domains = {
      data: [{ id: 'dmn_1', name: 'clerk.com' }],
      isLoading: false,
      hasNextPage: true,
      fetchNext,
      revalidate,
    };
    render(<Harness />);
    fireEvent.click(screen.getByText('Fetch next'));
    expect(fetchNext).toHaveBeenCalledTimes(1);
  });

  it('removes a domain via getDomain → delete → revalidate', async () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('Open remove'));
    expect(screen.getByTestId('remove-state')).toHaveTextContent('confirming');

    await act(async () => {
      fireEvent.click(screen.getByText('Confirm remove'));
    });

    expect(getDomain).toHaveBeenCalledWith({ domainId: 'dmn_1' });
    expect(deleteDomain).toHaveBeenCalledTimes(1);
    expect(revalidate).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('remove-state')).toHaveTextContent('idle');
  });

  it('builds enrollment options from the instance settings', () => {
    enrollmentModes = ['manual_invitation', 'automatic_suggestion'];
    render(<Harness />);
    expect(screen.getByTestId('enrollment-options')).toHaveTextContent('manual_invitation,automatic_suggestion');
  });

  it('updates enrollment via getDomain → updateEnrollmentMode → revalidate', async () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('Open enrollment'));
    fireEvent.click(screen.getByText('Select mode'));

    await act(async () => {
      fireEvent.click(screen.getByText('Submit enrollment'));
    });

    expect(getDomain).toHaveBeenCalledWith({ domainId: 'dmn_1' });
    expect(updateEnrollmentMode).toHaveBeenCalledWith({ enrollmentMode: 'automatic_invitation', deletePending: false });
    expect(revalidate).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('enrollment-state')).toHaveTextContent('closed');
  });

  it('adds a domain via createDomain → revalidate, advancing to the email step', async () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('Open add'));
    fireEvent.click(screen.getByText('Type name'));

    await act(async () => {
      fireEvent.click(screen.getByText('Submit name'));
    });

    expect(createDomain).toHaveBeenCalledWith('new.com');
    expect(revalidate).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('add-verify-state')).toHaveTextContent('enteringEmail');
  });
});
