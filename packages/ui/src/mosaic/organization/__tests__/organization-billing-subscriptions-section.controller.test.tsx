import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationBillingSubscriptionsSectionController } from '../organization-billing-subscriptions-section.controller';

const READ = 'org:sys_billing:read';
const MANAGE = 'org:sys_billing:manage';

type Money = { amount: number; currency: string; currencySymbol?: string; amountFormatted?: string };
type SubItem = {
  id: string;
  status: string;
  planPeriod: 'month' | 'annual';
  isFreeTrial: boolean;
  canceledAt: Date | null;
  pastDueAt: Date | null;
  periodStart: Date;
  periodEnd: Date | null;
  plan: { name: string; isDefault: boolean; fee?: Money; annualFee?: Money };
  seats?: { quantity: number | null; tiers?: Array<{ total: Money; quantity: number | null; feePerBlock: Money }> };
};

let permissions: string[];
let subscriberType: 'organization' | 'user';
let subscriptionItems: SubItem[];
let subscriptionData: { nextPayment?: { date: Date; totals?: { grandTotal: Money } } | null } | null;
let isLoading: boolean;
let hasPaidPlans: boolean;
let navigate: ReturnType<typeof vi.fn>;
let openSubscriptionDetails: ReturnType<typeof vi.fn>;

// The controller now derives all copy itself (no localization layer). Real utils operate on plan
// objects — none of the fixtures below carry seat unit prices, so the seat-limit copy is null and
// isManageableSubscriptionItem is just `!plan.isDefault`.
vi.mock('@clerk/shared/react', () => ({
  useSession: () => ({
    isLoaded: true,
    session: { checkAuthorization: ({ permission }: { permission: string }) => permissions.includes(permission) },
  }),
}));

vi.mock('../../hooks/useMosaicEnvironment', () => ({
  useMosaicEnvironment: () => ({
    commerceSettings: { billing: { user: { hasPaidPlans }, organization: { hasPaidPlans } } },
  }),
}));

vi.mock('@/router', () => ({
  useRouter: () => ({ navigate }),
}));

vi.mock('@/contexts', () => ({
  useSubscriberTypeContext: () => subscriberType,
  useSubscription: () => ({ subscriptionItems, data: subscriptionData, isLoading }),
  usePlansContext: () => ({ openSubscriptionDetails }),
}));

function item(overrides: Partial<SubItem> = {}): SubItem {
  return {
    id: 'sub_1',
    status: 'active',
    planPeriod: 'month',
    isFreeTrial: false,
    canceledAt: null,
    pastDueAt: null,
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-07-01'),
    plan: { name: 'Pro', isDefault: false, fee: { amount: 2000, currency: 'USD' } },
    ...overrides,
  };
}

beforeEach(() => {
  permissions = [READ, MANAGE];
  subscriberType = 'organization';
  subscriptionItems = [item()];
  subscriptionData = { nextPayment: null };
  isLoading = false;
  hasPaidPlans = true;
  navigate = vi.fn();
  openSubscriptionDetails = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const controller = useOrganizationBillingSubscriptionsSectionController();
  if (controller.status !== 'ready') {
    return <output data-testid='state'>{controller.status}</output>;
  }
  return (
    <div>
      <output data-testid='state'>ready</output>
      <output data-testid='title'>{controller.title}</output>
      <output data-testid='rows'>
        {controller.rows
          .map(r => `${r.id}|${r.planName}|${r.fee}|${r.feePeriod ?? ''}|${r.caption ?? ''}|${r.badge?.label ?? ''}`)
          .join(';')}
      </output>
      <output data-testid='overview'>
        {controller.overview ? `${controller.overview.grandTotal}|${controller.overview.renewsAt}` : ''}
      </output>
      <output data-testid='switch'>{controller.switchOrNewPlan?.label ?? ''}</output>
      <output data-testid='manage'>{controller.manage?.label ?? ''}</output>
      <button onClick={controller.onSwitchOrNewPlan}>trigger-switch</button>
      <button onClick={e => controller.onManageSubscription(e)}>trigger-manage</button>
    </div>
  );
}

describe('useOrganizationBillingSubscriptionsSectionController', () => {
  it('is hidden when the user cannot read billing', () => {
    permissions = [];
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('reads and manages billing for a user subscriber without org permissions', () => {
    subscriberType = 'user';
    permissions = [];
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('ready');
    // canManageBilling is true for a user subscriber, so the manage action still shows.
    expect(screen.getByTestId('manage')).toHaveTextContent('Manage');
  });

  it('is loading on first load with no items yet', () => {
    isLoading = true;
    subscriptionItems = [];
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is ready once loaded even with no items', () => {
    subscriptionItems = [];
    isLoading = false;
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('ready');
  });

  it('sorts active subscriptions first', () => {
    subscriptionItems = [
      item({ id: 'sub_upcoming', status: 'upcoming' }),
      item({ id: 'sub_active', status: 'active' }),
    ];
    render(<Harness />);
    const rows = screen.getByTestId('rows').textContent ?? '';
    expect(rows.indexOf('sub_active')).toBeLessThan(rows.indexOf('sub_upcoming'));
  });

  it('maps plan name, formatted (short) fee, and period suffix', () => {
    render(<Harness />);
    // $20.00/mo renders short ("$20") with the lowercased period word.
    expect(screen.getByTestId('rows')).toHaveTextContent('sub_1|Pro|$20|month|');
  });

  it('omits the period suffix for a $0 fee', () => {
    subscriptionItems = [item({ plan: { name: 'Free', isDefault: false, fee: { amount: 0, currency: 'USD' } } })];
    render(<Harness />);
    // feePeriod is empty (the `$0||` segment), regardless of the caption that follows.
    expect(screen.getByTestId('rows')).toHaveTextContent('Free|$0||');
  });

  it('derives the caption for a non-default plan', () => {
    render(<Harness />);
    expect(screen.getByTestId('rows')).toHaveTextContent('Renews');
  });

  it('hides the caption for the default plan when not upcoming', () => {
    subscriptionItems = [item({ plan: { name: 'Free', isDefault: true, fee: { amount: 0, currency: 'USD' } } })];
    render(<Harness />);
    expect(screen.getByTestId('rows')).not.toHaveTextContent('Renews');
  });

  it('shows the caption for the default plan when it is upcoming', () => {
    subscriptionItems = [
      item({ status: 'upcoming', plan: { name: 'Free', isDefault: true, fee: { amount: 0, currency: 'USD' } } }),
    ];
    render(<Harness />);
    expect(screen.getByTestId('rows')).toHaveTextContent('Starts');
  });

  it('captions a past-due subscription', () => {
    subscriptionItems = [item({ pastDueAt: new Date('2024-05-01') })];
    render(<Harness />);
    expect(screen.getByTestId('rows')).toHaveTextContent('Past due');
  });

  it('captions an upcoming subscription with its start date', () => {
    subscriptionItems = [item({ status: 'upcoming' })];
    render(<Harness />);
    expect(screen.getByTestId('rows')).toHaveTextContent('Starts');
  });

  it('captions a canceled subscription with its end date', () => {
    subscriptionItems = [item({ canceledAt: new Date('2024-06-01') })];
    render(<Harness />);
    expect(screen.getByTestId('rows')).toHaveTextContent('Canceled • Ends');
  });

  it('captions a free-trial subscription with its trial-end date', () => {
    subscriptionItems = [item({ isFreeTrial: true })];
    render(<Harness />);
    expect(screen.getByTestId('rows')).toHaveTextContent('Trial ends');
  });

  it('shows a badge for a single canceled subscription', () => {
    subscriptionItems = [item({ canceledAt: new Date('2024-06-01') })];
    render(<Harness />);
    expect(screen.getByTestId('rows')).toHaveTextContent('Active');
  });

  it('shows a badge when there is more than one subscription', () => {
    subscriptionItems = [item({ id: 'a', status: 'active' }), item({ id: 'b', status: 'upcoming' })];
    render(<Harness />);
    expect(screen.getByTestId('rows')).toHaveTextContent('Active');
    expect(screen.getByTestId('rows')).toHaveTextContent('Upcoming');
  });

  it('shows a free-trial badge for a trialing item', () => {
    subscriptionItems = [item({ isFreeTrial: true })];
    render(<Harness />);
    expect(screen.getByTestId('rows')).toHaveTextContent('Free trial');
  });

  it('derives the next-payment overview row', () => {
    subscriptionData = {
      nextPayment: { date: new Date('2024-06-01'), totals: { grandTotal: { amount: 5000, currency: 'USD' } } },
    };
    render(<Harness />);
    expect(screen.getByTestId('overview')).toHaveTextContent('$50.00|Renews');
  });

  it('omits the overview row when nextPayment has no totals', () => {
    subscriptionData = { nextPayment: { date: new Date('2024-06-01') } };
    render(<Harness />);
    expect(screen.getByTestId('overview')).toHaveTextContent('');
  });

  it('omits the overview row when there are no subscription items', () => {
    subscriptionItems = [];
    subscriptionData = {
      nextPayment: { date: new Date('2024-06-01'), totals: { grandTotal: { amount: 5000, currency: 'USD' } } },
    };
    render(<Harness />);
    expect(screen.getByTestId('overview')).toHaveTextContent('');
  });

  it('exposes the switch action label when paid plans exist and there are items', () => {
    render(<Harness />);
    expect(screen.getByTestId('switch')).toHaveTextContent('Switch plans');
  });

  it('exposes the new-subscription label when there are no items', () => {
    subscriptionItems = [];
    render(<Harness />);
    expect(screen.getByTestId('switch')).toHaveTextContent('Subscribe to a plan');
  });

  it('hides the switch action when no paid plans exist', () => {
    hasPaidPlans = false;
    render(<Harness />);
    expect(screen.getByTestId('switch')).toHaveTextContent('');
  });

  it('shows the manage action for a manageable subscription with manage permission', () => {
    render(<Harness />);
    expect(screen.getByTestId('manage')).toHaveTextContent('Manage');
  });

  it('hides the manage action without manage permission', () => {
    permissions = [READ];
    render(<Harness />);
    expect(screen.getByTestId('manage')).toHaveTextContent('');
  });

  it('hides the manage action when the only subscription is the default plan', () => {
    subscriptionItems = [item({ plan: { name: 'Free', isDefault: true, fee: { amount: 0, currency: 'USD' } } })];
    render(<Harness />);
    expect(screen.getByTestId('manage')).toHaveTextContent('');
  });

  it('navigates to plans on switch/new', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('trigger-switch'));
    expect(navigate).toHaveBeenCalledWith('plans');
  });

  it('opens the subscription details drawer on manage, forwarding the event', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('trigger-manage'));
    expect(openSubscriptionDetails).toHaveBeenCalledTimes(1);
    expect(openSubscriptionDetails.mock.calls[0][0]).toBeTruthy();
  });
});
