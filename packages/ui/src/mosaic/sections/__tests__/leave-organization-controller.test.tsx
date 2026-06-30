import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { deferred } from '../../machines/__tests__/test-utils';
import { useLeaveOrganizationController } from '../leave-organization-controller';

const ORG_NAME = 'Acme Inc';

let destroy: ReturnType<typeof vi.fn>;
let revalidate: ReturnType<typeof vi.fn>;
let isLoaded: boolean;
let organization: { id: string; name: string } | null;
let membership: { id: string; destroy: () => Promise<void> } | null;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof import('@clerk/shared/react')>();
  return {
    ...actual,
    useOrganization: () => ({ isLoaded, organization, membership }),
    useOrganizationList: () => ({ userMemberships: { revalidate } }),
  };
});

beforeEach(() => {
  destroy = vi.fn();
  revalidate = vi.fn().mockResolvedValue(undefined);
  isLoaded = true;
  organization = { id: 'org_1', name: ORG_NAME };
  membership = { id: 'mem_1', destroy };
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const controller = useLeaveOrganizationController();
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

describe('useLeaveOrganizationController', () => {
  it('is loading until useOrganization is loaded', () => {
    isLoaded = false;

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
    destroy.mockReturnValue(gate.promise);

    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('idle');

    openAndConfirm();
    expect(screen.getByTestId('state')).toHaveTextContent('leaving');

    await act(async () => {
      gate.resolve();
    });

    expect(screen.getByTestId('state')).toHaveTextContent('left');
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(revalidate).toHaveBeenCalledTimes(1);
  });

  it('returns to confirming with an error message when leaving rejects', async () => {
    const gate = deferred<void>();
    destroy.mockReturnValue(gate.promise);

    render(<Harness />);
    openAndConfirm();
    expect(screen.getByTestId('state')).toHaveTextContent('leaving');

    await act(async () => {
      gate.reject(new Error('nope'));
    });

    expect(screen.getByTestId('state')).toHaveTextContent('confirming');
    expect(screen.getByTestId('error')).toHaveTextContent('nope');
    expect(revalidate).not.toHaveBeenCalled();
  });
});
