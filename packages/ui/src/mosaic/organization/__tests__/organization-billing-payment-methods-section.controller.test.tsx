import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { deferred } from '../../machines/__tests__/test-utils';
import { useOrganizationBillingPaymentMethodsSectionController } from '../organization-billing-payment-methods-section.controller';
import type { PaymentMethodRow } from '../organization-billing-payment-methods-section.view';

interface MockMethod {
  id: string;
  paymentType?: 'card';
  cardType: string | null;
  last4: string | null;
  isDefault?: boolean;
  isRemovable?: boolean;
  status: string;
  remove: ReturnType<typeof vi.fn>;
  makeDefault: ReturnType<typeof vi.fn>;
}

let paymentMethods: MockMethod[];
let isLoading: boolean;
let revalidate: ReturnType<typeof vi.fn>;
let isSessionLoaded: boolean;
let checkAuthorization: ReturnType<typeof vi.fn>;
let subscriberType: 'organization' | 'user';
let reverificationCalls: number;
let orgAddPaymentMethod: ReturnType<typeof vi.fn>;
let userAddPaymentMethod: ReturnType<typeof vi.fn>;

vi.mock('@/contexts', () => ({
  usePaymentMethods: () => ({ data: paymentMethods, isLoading, revalidate }),
  useSubscriberTypeContext: () => subscriberType,
}));

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof import('@clerk/shared/react')>();
  return {
    ...actual,
    useSession: () => ({
      isLoaded: isSessionLoaded,
      session: isSessionLoaded ? { id: 'sess_1', checkAuthorization } : undefined,
    }),
    useClerk: () => ({ user: { addPaymentMethod: userAddPaymentMethod } }),
    __internal_useOrganizationBase: () => ({ id: 'org_1', addPaymentMethod: orgAddPaymentMethod }),
    // Stand-in for the real reverification enhancer: count each wrapped call so tests can assert
    // a mutation is routed through step-up auth, then delegate to the underlying fetcher.
    useReverification: (fetcher: (...args: unknown[]) => unknown) => {
      return (...args: unknown[]) => {
        reverificationCalls += 1;
        return fetcher(...args);
      };
    },
  };
});

function makeMethod(overrides: Partial<MockMethod>): MockMethod {
  return {
    id: 'pm_1',
    paymentType: 'card',
    cardType: 'visa',
    last4: '4242',
    isDefault: false,
    isRemovable: true,
    status: 'active',
    remove: vi.fn().mockResolvedValue(undefined),
    makeDefault: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

beforeEach(() => {
  paymentMethods = [makeMethod({ id: 'pm_1' })];
  isLoading = false;
  revalidate = vi.fn().mockResolvedValue(undefined);
  isSessionLoaded = true;
  checkAuthorization = vi.fn().mockReturnValue(true);
  subscriberType = 'organization';
  reverificationCalls = 0;
  orgAddPaymentMethod = vi.fn().mockResolvedValue(undefined);
  userAddPaymentMethod = vi.fn().mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

let latest: ReturnType<typeof useOrganizationBillingPaymentMethodsSectionController>;

function Harness() {
  const controller = useOrganizationBillingPaymentMethodsSectionController();
  latest = controller;
  if (controller.status !== 'ready') {
    return <output data-testid='state'>{controller.status}</output>;
  }
  return (
    <div>
      <output data-testid='state'>ready</output>
      <output data-testid='rows'>
        {controller.rows
          .map(r => `${r.typeLabel}/${r.detailLabel}/${r.label}/${r.isDefault}/${r.isExpired}/${r.isRemovable}`)
          .join(';')}
      </output>
      <output data-testid='pending'>{controller.makeDefaultPendingId ?? ''}</output>
      <output data-testid='mdError'>{controller.makeDefaultError ?? ''}</output>
      <output data-testid='removeOpen'>{String(controller.remove.open)}</output>
      <output data-testid='removeLabel'>{controller.remove.label}</output>
      <output data-testid='removeError'>{controller.remove.error ?? ''}</output>
      <output data-testid='addAvailable'>{String(controller.add.available)}</output>
      <output data-testid='addOpen'>{String(controller.add.open)}</output>
      <output data-testid='addSubmitting'>{String(controller.add.submitting)}</output>
      <output data-testid='addError'>{controller.add.error ?? ''}</output>
    </div>
  );
}

function row(id: string): PaymentMethodRow {
  const controller = latest;
  if (controller.status !== 'ready') {
    throw new Error('not ready');
  }
  const found = controller.rows.find(r => r.id === id);
  if (!found) {
    throw new Error(`row ${id} not found`);
  }
  return found;
}

describe('useOrganizationBillingPaymentMethodsSectionController', () => {
  it('is loading until the session is loaded', () => {
    isSessionLoaded = false;

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('loading');
    expect(checkAuthorization).not.toHaveBeenCalled();
  });

  it('is hidden when the user lacks the manage permission', () => {
    checkAuthorization.mockReturnValue(false);

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
    expect(checkAuthorization).toHaveBeenCalledWith({ permission: 'org:sys_billing:manage' });
  });

  it('is loading while the first page of methods is still fetching', () => {
    paymentMethods = [];
    isLoading = true;

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('maps methods to rows with the default listed first', () => {
    paymentMethods = [
      makeMethod({ id: 'pm_1', cardType: 'visa', last4: '4242', isDefault: false }),
      makeMethod({ id: 'pm_2', cardType: 'mastercard', last4: '1111', isDefault: true }),
    ];

    render(<Harness />);

    expect(screen.getByTestId('rows')).toHaveTextContent(
      'Mastercard/⋯ 1111/mastercard ⋯ 1111/true/false/true;Visa/⋯ 4242/visa ⋯ 4242/false/false/true',
    );
  });

  it('marks expired methods and non-removable methods', () => {
    paymentMethods = [makeMethod({ id: 'pm_1', status: 'expired', isRemovable: false })];

    render(<Harness />);

    expect(row('pm_1').isExpired).toBe(true);
    expect(row('pm_1').isRemovable).toBe(false);
  });

  it('makes a method default with the org id, then revalidates', async () => {
    const gate = deferred<void>();
    paymentMethods = [makeMethod({ id: 'pm_1' })];
    paymentMethods[0].makeDefault.mockReturnValue(gate.promise);

    render(<Harness />);

    act(() => {
      latest.status === 'ready' && latest.onMakeDefault('pm_1');
    });
    expect(screen.getByTestId('pending')).toHaveTextContent('pm_1');
    expect(paymentMethods[0].makeDefault).toHaveBeenCalledWith({ orgId: 'org_1' });

    await act(async () => {
      gate.resolve();
    });

    expect(screen.getByTestId('pending')).toHaveTextContent('');
    expect(revalidate).toHaveBeenCalledTimes(1);
    // make-default is not reverified in the legacy flow; keep parity.
    expect(reverificationCalls).toBe(0);
  });

  it('surfaces a make-default error', async () => {
    paymentMethods = [makeMethod({ id: 'pm_1' })];
    paymentMethods[0].makeDefault.mockRejectedValue(new Error('card declined'));

    render(<Harness />);

    await act(async () => {
      latest.status === 'ready' && latest.onMakeDefault('pm_1');
    });

    expect(screen.getByTestId('mdError')).toHaveTextContent('card declined');
  });

  it('opens the remove confirmation, removes with the org id, then revalidates', async () => {
    const gate = deferred<void>();
    paymentMethods = [makeMethod({ id: 'pm_1' })];
    paymentMethods[0].remove.mockReturnValue(gate.promise);

    render(<Harness />);

    act(() => {
      latest.status === 'ready' && latest.onRemove(row('pm_1'));
    });
    expect(screen.getByTestId('removeOpen')).toHaveTextContent('true');
    expect(screen.getByTestId('removeLabel')).toHaveTextContent('visa ⋯ 4242');

    act(() => {
      latest.status === 'ready' && latest.remove.onConfirm();
    });
    expect(paymentMethods[0].remove).toHaveBeenCalledWith({ orgId: 'org_1' });

    await act(async () => {
      gate.resolve();
    });

    expect(screen.getByTestId('removeOpen')).toHaveTextContent('false');
    expect(revalidate).toHaveBeenCalledTimes(1);
  });

  it('routes the remove through reverification (step-up auth), matching the legacy flow', async () => {
    const gate = deferred<void>();
    paymentMethods = [makeMethod({ id: 'pm_1' })];
    paymentMethods[0].remove.mockReturnValue(gate.promise);

    render(<Harness />);

    act(() => {
      latest.status === 'ready' && latest.onRemove(row('pm_1'));
    });
    act(() => {
      latest.status === 'ready' && latest.remove.onConfirm();
    });

    expect(reverificationCalls).toBe(1);
    expect(paymentMethods[0].remove).toHaveBeenCalledWith({ orgId: 'org_1' });

    await act(async () => {
      gate.resolve();
    });

    expect(revalidate).toHaveBeenCalledTimes(1);
  });

  it('cancels the remove confirmation without removing', () => {
    render(<Harness />);

    act(() => {
      latest.status === 'ready' && latest.onRemove(row('pm_1'));
    });
    act(() => {
      latest.status === 'ready' && latest.remove.onCancel();
    });

    expect(screen.getByTestId('removeOpen')).toHaveTextContent('false');
    expect(paymentMethods[0].remove).not.toHaveBeenCalled();
  });

  it('passes undefined orgId for a user subscriber', () => {
    subscriberType = 'user';

    render(<Harness />);

    act(() => {
      latest.status === 'ready' && latest.onMakeDefault('pm_1');
    });

    expect(paymentMethods[0].makeDefault).toHaveBeenCalledWith({ orgId: undefined });
  });

  it('offers the add entry point and opens it', () => {
    render(<Harness />);

    // __BUILD_DISABLE_RHC__ is false under test, so the add flow is available.
    expect(screen.getByTestId('addAvailable')).toHaveTextContent('true');
    expect(screen.getByTestId('addOpen')).toHaveTextContent('false');

    act(() => {
      latest.status === 'ready' && latest.add.onOpen();
    });

    expect(screen.getByTestId('addOpen')).toHaveTextContent('true');
  });

  it('adds the tokenized method to the organization payer, then revalidates and closes', async () => {
    const gate = deferred<void>();
    orgAddPaymentMethod.mockReturnValue(gate.promise);

    render(<Harness />);

    act(() => {
      latest.status === 'ready' && latest.add.onOpen();
    });
    act(() => {
      latest.status === 'ready' && latest.add.onSubmit({ gateway: 'stripe', paymentToken: 'pm_token_123' });
    });

    expect(screen.getByTestId('addSubmitting')).toHaveTextContent('true');
    expect(orgAddPaymentMethod).toHaveBeenCalledWith({ gateway: 'stripe', paymentToken: 'pm_token_123' });

    await act(async () => {
      gate.resolve();
    });

    expect(screen.getByTestId('addOpen')).toHaveTextContent('false');
    expect(revalidate).toHaveBeenCalledTimes(1);
    // Legacy add is not reverified; keep parity.
    expect(reverificationCalls).toBe(0);
  });

  it('adds the tokenized method to the user payer for a user subscriber', () => {
    subscriberType = 'user';

    render(<Harness />);

    act(() => {
      latest.status === 'ready' && latest.add.onOpen();
    });
    act(() => {
      latest.status === 'ready' && latest.add.onSubmit({ gateway: 'stripe', paymentToken: 'pm_token_123' });
    });

    expect(userAddPaymentMethod).toHaveBeenCalledWith({ gateway: 'stripe', paymentToken: 'pm_token_123' });
    expect(orgAddPaymentMethod).not.toHaveBeenCalled();
  });

  it('surfaces an add error and stays open', async () => {
    orgAddPaymentMethod.mockRejectedValue(new Error('card declined'));

    render(<Harness />);

    act(() => {
      latest.status === 'ready' && latest.add.onOpen();
    });
    await act(async () => {
      latest.status === 'ready' && latest.add.onSubmit({ gateway: 'stripe', paymentToken: 'pm_token_123' });
    });

    expect(screen.getByTestId('addError')).toHaveTextContent('card declined');
    expect(screen.getByTestId('addOpen')).toHaveTextContent('true');
  });

  it('cancels the add flow without adding', () => {
    render(<Harness />);

    act(() => {
      latest.status === 'ready' && latest.add.onOpen();
    });
    act(() => {
      latest.status === 'ready' && latest.add.onCancel();
    });

    expect(screen.getByTestId('addOpen')).toHaveTextContent('false');
    expect(orgAddPaymentMethod).not.toHaveBeenCalled();
  });
});
