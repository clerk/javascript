import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { deferred } from '../../machines/__tests__/test-utils';
import { useOrganizationProfileDeleteSectionController } from '../organization-profile-delete-section.controller';

const ORG_NAME = 'Acme Inc';

let destroy: ReturnType<typeof vi.fn>;
let revalidate: ReturnType<typeof vi.fn>;
let navigate: ReturnType<typeof vi.fn>;
let afterLeaveUrl: string;
let checkAuthorization: ReturnType<typeof vi.fn>;
let isLoaded: boolean;
let isSessionLoaded: boolean;
let organization: { id: string; name: string; destroy: () => Promise<void>; adminDeleteEnabled: boolean } | null;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof import('@clerk/shared/react')>();
  return {
    ...actual,
    useOrganization: () => ({ isLoaded, organization, membership: null }),
    useOrganizationList: () => ({ userMemberships: { revalidate } }),
    useSession: () => ({
      isLoaded: isSessionLoaded,
      session: isSessionLoaded ? { id: 'sess_1', checkAuthorization } : undefined,
    }),
    useClerk: () => ({
      navigate,
      __internal_environment: { displayConfig: { afterLeaveOrganizationUrl: afterLeaveUrl } },
    }),
  };
});

beforeEach(() => {
  destroy = vi.fn();
  revalidate = vi.fn().mockResolvedValue(undefined);
  navigate = vi.fn().mockResolvedValue(undefined);
  afterLeaveUrl = '/after-leave';
  checkAuthorization = vi.fn().mockReturnValue(true);
  isLoaded = true;
  isSessionLoaded = true;
  organization = { id: 'org_1', name: ORG_NAME, destroy, adminDeleteEnabled: true };
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const controller = useOrganizationProfileDeleteSectionController();
  if (controller.status !== 'ready') {
    return <output data-testid='state'>{controller.status}</output>;
  }
  return (
    <div>
      <output data-testid='state'>{controller.snapshot.value}</output>
      <output data-testid='error'>{controller.snapshot.context.error ?? ''}</output>
      <button onClick={() => controller.send({ type: 'OPEN' })}>Open</button>
      <button onClick={() => controller.send({ type: 'TYPE_CONFIRMATION', value: ORG_NAME })}>Type</button>
      <button onClick={() => controller.send({ type: 'CONFIRM' })}>Confirm</button>
    </div>
  );
}

function openAndConfirm() {
  fireEvent.click(screen.getByText('Open'));
  fireEvent.click(screen.getByText('Type'));
  fireEvent.click(screen.getByText('Confirm'));
}

describe('useOrganizationProfileDeleteSectionController', () => {
  it('is loading until useOrganization is loaded', () => {
    isLoaded = false;

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is loading until the session is loaded', () => {
    isSessionLoaded = false;

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('loading');
    expect(checkAuthorization).not.toHaveBeenCalled();
  });

  it('is ready when the user can delete and admin delete is enabled', () => {
    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('idle');
    expect(checkAuthorization).toHaveBeenCalledWith({ permission: 'org:sys_profile:delete' });
  });

  it('is hidden when the user lacks the delete permission', () => {
    checkAuthorization.mockReturnValue(false);

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('is hidden when admin delete is disabled', () => {
    organization = { id: 'org_1', name: ORG_NAME, destroy, adminDeleteEnabled: false };

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('drives CONFIRM → deleting → resolve → deleted', async () => {
    const gate = deferred<void>();
    destroy.mockReturnValue(gate.promise);

    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('idle');

    openAndConfirm();
    expect(screen.getByTestId('state')).toHaveTextContent('deleting');

    await act(async () => {
      gate.resolve();
    });

    expect(screen.getByTestId('state')).toHaveTextContent('deleted');
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(revalidate).toHaveBeenCalledTimes(1);
  });

  it('navigates to afterLeaveOrganizationUrl after a successful delete', async () => {
    const gate = deferred<void>();
    destroy.mockReturnValue(gate.promise);

    render(<Harness />);
    openAndConfirm();

    await act(async () => {
      gate.resolve();
    });

    expect(navigate).toHaveBeenCalledWith('/after-leave');
  });

  it('returns to confirming with an error message when deleting rejects', async () => {
    const gate = deferred<void>();
    destroy.mockReturnValue(gate.promise);

    render(<Harness />);
    openAndConfirm();
    expect(screen.getByTestId('state')).toHaveTextContent('deleting');

    await act(async () => {
      gate.reject(new Error('nope'));
    });

    expect(screen.getByTestId('state')).toHaveTextContent('confirming');
    expect(screen.getByTestId('error')).toHaveTextContent('nope');
    expect(revalidate).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
