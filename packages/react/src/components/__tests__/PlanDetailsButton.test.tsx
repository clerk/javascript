import '@testing-library/jest-dom/vitest';

import type { CommercePayerResourceType, CommercePlanResource, Theme } from '@clerk/types';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlanDetailsButton } from '../PlanDetailsButton';

const mockOpenPlanDetails = vi.fn();

const mockClerk = {
  __internal_openPlanDetails: mockOpenPlanDetails,
};

// Mock the withClerk HOC
vi.mock('../withClerk', () => {
  return {
    withClerk: (Component: any) => (props: any) => {
      return (
        <Component
          {...props}
          clerk={mockClerk}
        />
      );
    },
  };
});

const mockPlanResource: CommercePlanResource = {
  id: 'plan_123',
  name: 'Test Plan',
  amount: 1000,
  amountFormatted: '10.00',
  annualAmount: 10000,
  annualAmountFormatted: '100.00',
  annualMonthlyAmount: 833,
  annualMonthlyAmountFormatted: '8.33',
  currencySymbol: '$',
  description: 'Test Plan Description',
  hasBaseFee: true,
  isRecurring: true,
  currency: 'USD',
  isDefault: false,
  forPayerType: 'user' as CommercePayerResourceType,
  publiclyVisible: true,
  slug: 'test-plan',
  avatarUrl: 'https://example.com/avatar.png',
  features: [],
  __internal_toSnapshot: vi.fn(),
  pathRoot: '',
  reload: vi.fn(),
};

describe('PlanDetailsButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default "Plan details" text when no children provided', () => {
      render(<PlanDetailsButton planId='test_plan' />);

      expect(screen.getByText('Plan details')).toBeInTheDocument();
    });

    it('renders custom button content when provided', () => {
      render(
        <PlanDetailsButton planId='test_plan'>
          <button>View Plan</button>
        </PlanDetailsButton>,
      );

      expect(screen.getByText('View Plan')).toBeInTheDocument();
    });

    it('passes additional props to child element', () => {
      render(
        <PlanDetailsButton
          planId='test_plan'
          data-testid='plan-details-btn'
        >
          <button>Plan details</button>
        </PlanDetailsButton>,
      );

      expect(screen.getByTestId('plan-details-btn')).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('calls clerk.__internal_openPlanDetails with planId when clicked', async () => {
      const props = {
        planId: 'test_plan',
        initialPlanPeriod: 'month' as const,
        planDetailsProps: {
          appearance: {} as Theme,
        },
      };

      render(<PlanDetailsButton {...props} />);

      await userEvent.click(screen.getByText('Plan details'));

      await waitFor(() => {
        expect(mockOpenPlanDetails).toHaveBeenCalledWith(
          expect.objectContaining({ ...props.planDetailsProps, planId: props.planId }),
        );
      });
    });

    it('calls clerk.__internal_openPlanDetails with plan object when clicked', async () => {
      const props = {
        plan: mockPlanResource,
        planDetailsProps: {
          appearance: {} as Theme,
        },
      };

      render(<PlanDetailsButton {...props} />);

      await userEvent.click(screen.getByText('Plan details'));

      await waitFor(() => {
        expect(mockOpenPlanDetails).toHaveBeenCalledWith(
          expect.objectContaining({ ...props.planDetailsProps, plan: props.plan }),
        );
      });
    });

    it('executes child onClick handler before opening plan details', async () => {
      const childOnClick = vi.fn();
      const props = { planId: 'test_plan' };

      render(
        <PlanDetailsButton {...props}>
          <button onClick={childOnClick}>Custom Button</button>
        </PlanDetailsButton>,
      );

      await userEvent.click(screen.getByText('Custom Button'));

      await waitFor(() => {
        expect(childOnClick).toHaveBeenCalled();
        expect(mockOpenPlanDetails).toHaveBeenCalledWith(expect.objectContaining(props));
      });
    });
  });

  describe('Portal Configuration', () => {
    it('handles portal configuration correctly', async () => {
      const portalProps = {
        planId: 'test_plan',
        planDetailsProps: {
          portalId: 'custom-portal',
          portalRoot: document.createElement('div'),
        },
      };

      render(<PlanDetailsButton {...portalProps} />);

      await userEvent.click(screen.getByText('Plan details'));

      await waitFor(() => {
        expect(mockOpenPlanDetails).toHaveBeenCalledWith(
          expect.objectContaining({ ...portalProps.planDetailsProps, planId: portalProps.planId }),
        );
      });
    });
  });
});
