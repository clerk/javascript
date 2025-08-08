import { Drawer } from '@/ui/elements/Drawer';

import { render, waitFor } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { PlanDetails } from '../PlanDetails';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('PlanDetails', () => {
  const mockFeature = {
    id: 'feature_1',
    name: 'Feature 1',
    description: 'Feature 1 Description',
    avatarUrl: 'https://example.com/feature1.png',
    slug: 'feature-1',
    __internal_toSnapshot: jest.fn(),
    pathRoot: '',
    reload: jest.fn(),
  };

  const mockFeature2 = {
    id: 'feature_2',
    name: 'Feature 2',
    description: 'Feature 2 Description',
    avatarUrl: 'https://example.com/feature2.png',
    slug: 'feature-2',
    __internal_toSnapshot: jest.fn(),
    pathRoot: '',
    reload: jest.fn(),
  };

  const mockPlan = {
    id: 'plan_123',
    name: 'Test Plan',
    fee: {
      amount: 1000,
      amountFormatted: '10.00',
      currencySymbol: '$',
      currency: 'USD',
    },
    annualFee: {
      amount: 10000,
      amountFormatted: '100.00',
      currencySymbol: '$',
      currency: 'USD',
    },
    annualMonthlyFee: {
      amount: 833,
      amountFormatted: '8.33',
      currencySymbol: '$',
      currency: 'USD',
    },
    description: 'Test Plan Description',
    hasBaseFee: true,
    isRecurring: true,
    isDefault: false,
    payerType: ['user'],
    forPayerType: 'user' as const,
    publiclyVisible: true,
    slug: 'test-plan',
    avatarUrl: 'https://example.com/avatar.png',
    features: [mockFeature, mockFeature2],
    __internal_toSnapshot: jest.fn(),
    pathRoot: '',
    reload: jest.fn(),
  };

  it('displays spinner when loading with planId', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    fixtures.clerk.billing.getPlan.mockImplementation(() => new Promise(() => {}));

    const { baseElement, queryByRole } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <PlanDetails planId='plan_123' />
      </Drawer.Root>,
      { wrapper },
    );

    const spinner = baseElement.querySelector('span[aria-live="polite"]');
    expect(spinner).toBeVisible();
    expect(queryByRole('heading', { name: 'Test Plan' })).toBeNull();
  });

  it('renders plan details when plan is provided directly', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const { getByText, getByRole, baseElement } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <PlanDetails plan={mockPlan} />
      </Drawer.Root>,
      { wrapper },
    );

    const spinner = baseElement.querySelector('span[aria-live="polite"]');
    expect(spinner).toBeNull();
    expect(getByRole('heading', { name: 'Test Plan' })).toBeVisible();
    expect(getByText('Test Plan Description')).toBeVisible();
    expect(getByText('$10')).toBeVisible();
    expect(getByText('Feature 1')).toBeVisible();
    expect(getByText('Feature 1 Description')).toBeVisible();
    expect(getByText('Feature 2')).toBeVisible();
    expect(getByText('Feature 2 Description')).toBeVisible();
  });

  it('fetches and renders plan details when planId is provided', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    fixtures.clerk.billing.getPlan.mockResolvedValue(mockPlan);

    const { getByText, getByRole } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <PlanDetails planId='plan_123' />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(fixtures.clerk.billing.getPlan).toHaveBeenCalledWith({ id: 'plan_123' });
      expect(getByRole('heading', { name: 'Test Plan' })).toBeVisible();
      expect(getByText('Test Plan Description')).toBeVisible();
      expect(getByText('$10')).toBeVisible();
    });
  });

  it('uses default monthly plan period when not specified', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const { getByText, queryByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <PlanDetails plan={mockPlan} />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByText('$10')).toBeVisible();
      expect(queryByText('$8.33')).toBeNull();
    });
  });

  it('respects initialPlanPeriod when provided as annual', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const { getByText, queryByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <PlanDetails
          plan={mockPlan}
          initialPlanPeriod='annual'
        />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByText('$8.33')).toBeVisible();
      expect(queryByText('$10')).toBeNull();
    });
  });

  it('toggles between monthly and annual pricing when switch is clicked', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const { getByText, getByRole, userEvent } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <PlanDetails plan={mockPlan} />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByText('$10')).toBeVisible();
    });

    const switchButton = getByRole('switch', { name: /billed annually/i });
    await userEvent.click(switchButton);

    await waitFor(() => {
      expect(getByText('$8.33')).toBeVisible();
    });
  });

  it('does not show period toggle for plans with no annual pricing', async () => {
    const planWithoutAnnual = {
      ...mockPlan,
      fee: {
        amount: 0,
        amountFormatted: '0.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualFee: {
        amount: 0,
        amountFormatted: '0.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualMonthlyFee: {
        amount: 0,
        amountFormatted: '0.00',
        currencySymbol: '$',
        currency: 'USD',
      },
    };

    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const { queryByRole, getByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <PlanDetails plan={planWithoutAnnual} />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(queryByRole('switch')).toBeNull();
      expect(getByText(/only billed monthly/i)).toBeVisible();
    });
  });

  it('shows "Always free" notice for default free plans', async () => {
    const freePlan = {
      ...mockPlan,

      fee: {
        amount: 0,
        amountFormatted: '0.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualFee: {
        amount: 0,
        amountFormatted: '0.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualMonthlyFee: {
        amount: 0,
        amountFormatted: '0.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      isDefault: true,
    };

    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const { getByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <PlanDetails plan={freePlan} />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByText(/always free/i)).toBeVisible();
    });
  });

  it('renders plan without features correctly', async () => {
    const planWithoutFeatures = {
      ...mockPlan,
      features: [],
    };

    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const { queryByText, getByRole } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <PlanDetails plan={planWithoutFeatures} />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Test Plan' })).toBeVisible();
      expect(queryByText(/available features/i)).toBeNull();
    });
  });
});
