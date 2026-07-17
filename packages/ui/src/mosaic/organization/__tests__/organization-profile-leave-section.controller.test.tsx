import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { deferred } from '../../machines/__tests__/test-utils';
import { useOrganizationProfileLeaveSectionController } from '../organization-profile-leave-section.controller';

const ORG_NAME = 'Acme Inc';

let leaveOrganization: ReturnType<typeof vi.fn>;
let revalidate: ReturnType<typeof vi.fn>;
let navigate: ReturnType<typeof vi.fn>;
let afterLeaveUrl: string;
let isLoaded: boolean;
let organization: { id: string; name: string } | null;
let membership: { id: string } | null | undefined;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof import('@clerk/shared/react')>();
  return {
    ...actual,
    useOrganization: () => ({ isLoaded, organization, membership }),
    useOrganizationList: () => ({ userMemberships: { revalidate } }),
    useUser: () => ({ user: { leaveOrganization } }),
    useClerk: () => ({
      navigate,
      __internal_environment: { displayConfig: { afterLeaveOrganizationUrl: afterLeaveUrl } },
    }),
  };
});

beforeEach(() => {
  leaveOrganization = vi.fn();
  revalidate = vi.fn().mockResolvedValue(undefined);
  navigate = vi.fn().mockResolvedValue(undefined);
  afterLeaveUrl = '/after-leave';
  isLoaded = true;
  organization = { id: 'org_1', name: ORG_NAME };
  membership = { id: 'mem_1' };
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const controller = useOrganizationProfileLeaveSectionController();
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

describe('useOrganizationProfileLeaveSectionController', () => {
  it('is loading until useOrganization is loaded', () => {
    isLoaded = false;

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is loading while membership is still resolving', () => {
    membership = undefined;

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is hidden when there is no active organization', () => {
    organization = null;

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('is hidden when there is no membership', () => {
    membership = null;

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('drives CONFIRM → leaving → resolve → left', async () => {
    const gate = deferred<void>();
    leaveOrganization.mockReturnValue(gate.promise);

    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('idle');

    openAndConfirm();
    expect(screen.getByTestId('state')).toHaveTextContent('leaving');

    await act(async () => {
      gate.resolve();
    });

    expect(screen.getByTestId('state')).toHaveTextContent('left');
    expect(leaveOrganization).toHaveBeenCalledWith('org_1');
    expect(revalidate).toHaveBeenCalledTimes(1);
  });

  it('navigates to afterLeaveOrganizationUrl after a successful leave', async () => {
    const gate = deferred<void>();
    leaveOrganization.mockReturnValue(gate.promise);

    render(<Harness />);
    openAndConfirm();

    await act(async () => {
      gate.resolve();
    });

    expect(navigate).toHaveBeenCalledWith('/after-leave');
  });

  it('returns to confirming with an error message when leaving rejects', async () => {
    const gate = deferred<void>();
    leaveOrganization.mockReturnValue(gate.promise);

    render(<Harness />);
    openAndConfirm();
    expect(screen.getByTestId('state')).toHaveTextContent('leaving');

    await act(async () => {
      gate.reject(new Error('nope'));
    });

    expect(screen.getByTestId('state')).toHaveTextContent('confirming');
    expect(screen.getByTestId('error')).toHaveTextContent('nope');
    expect(revalidate).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
