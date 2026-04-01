import '@testing-library/jest-dom/vitest';

import type { Theme } from '@clerk/ui/internal';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '../../hooks';
import { CheckoutButton } from '../CheckoutButton';

// Mock the useAuth hook
vi.mock('../../hooks', () => ({
  useAuth: vi.fn(),
}));

const mockOpenCheckout = vi.fn();

const mockClerk = {
  __internal_openCheckout: mockOpenCheckout,
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

describe('CheckoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication Validation', () => {
    it('throws error when rendered without authenticated user', () => {
      // Mock useAuth to return null userId
      (useAuth as any).mockReturnValue({ userId: null, orgId: null });

      // Expect the component to throw an error
      expect(() => render(<CheckoutButton planId='test_plan' />)).toThrow(
        'Ensure that `<CheckoutButton />` is rendered only when the user is signed in (wrap with `<Show when="signed-in">` or guard with `useAuth()`).',
      );
    });

    it('throws error when using org subscriber type without active organization', () => {
      // Mock useAuth to return userId but no orgId
      (useAuth as any).mockReturnValue({ userId: 'user_123', orgId: null });

      // Expect the component to throw an error when for is "organization"
      expect(() =>
        render(
          <CheckoutButton
            planId='test_plan'
            for='organization'
          />,
        ),
      ).toThrow(
        'Wrap `<CheckoutButton for="organization" />` with a check for an active organization. Retrieve `orgId` from `useAuth()` and confirm it is defined.',
      );
    });

    it('renders successfully with authenticated user', () => {
      // Mock useAuth to return valid userId
      (useAuth as any).mockReturnValue({ userId: 'user_123', orgId: null });

      // Component should render without throwing
      expect(() => render(<CheckoutButton planId='test_plan' />)).not.toThrow();
    });

    it('renders successfully with org subscriber type when organization is active', () => {
      // Mock useAuth to return both userId and orgId
      (useAuth as any).mockReturnValue({ userId: 'user_123', orgId: 'org_123' });

      // Component should render without throwing
      expect(() =>
        render(
          <CheckoutButton
            planId='test_plan'
            for='organization'
          />,
        ),
      ).not.toThrow();
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      // Set up valid authentication for all event tests
      (useAuth as any).mockReturnValue({ userId: 'user_123', orgId: null });
    });

    it('calls clerk.__internal_openCheckout with correct props when clicked', async () => {
      const props = {
        planId: 'test_plan',
        planPeriod: 'month' as const,
        onSubscriptionComplete: vi.fn(),
        newSubscriptionRedirectUrl: '/success',
        checkoutProps: {
          appearance: {} as Theme,
          onClose: vi.fn(),
        },
      };

      render(<CheckoutButton {...props} />);

      await userEvent.click(screen.getByText('Checkout'));

      await waitFor(() => {
        expect(mockOpenCheckout).toHaveBeenCalledWith(
          expect.objectContaining({
            ...props.checkoutProps,
            planId: props.planId,
            onSubscriptionComplete: props.onSubscriptionComplete,
            newSubscriptionRedirectUrl: props.newSubscriptionRedirectUrl,
            planPeriod: props.planPeriod,
          }),
        );
      });
    });

    it('executes child onClick handler before opening checkout', async () => {
      const childOnClick = vi.fn();
      const props = { planId: 'test_plan' };

      render(
        <CheckoutButton {...props}>
          <button onClick={childOnClick}>Custom Button</button>
        </CheckoutButton>,
      );

      await userEvent.click(screen.getByText('Custom Button'));

      await waitFor(() => {
        expect(childOnClick).toHaveBeenCalled();
        expect(mockOpenCheckout).toHaveBeenCalledWith(expect.objectContaining(props));
      });
    });

    it('uses default "Checkout" text when no children provided', () => {
      render(<CheckoutButton planId='test_plan' />);

      expect(screen.getByText('Checkout')).toBeInTheDocument();
    });

    it('renders custom button content when provided', () => {
      render(
        <CheckoutButton planId='test_plan'>
          <button>Subscribe Now</button>
        </CheckoutButton>,
      );

      expect(screen.getByText('Subscribe Now')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    beforeEach(() => {
      (useAuth as any).mockReturnValue({ userId: 'user_123', orgId: null });
    });

    it('passes additional props to child element', () => {
      render(
        <CheckoutButton
          planId='test_plan'
          data-testid='checkout-btn'
        >
          <button>Checkout</button>
        </CheckoutButton>,
      );

      expect(screen.getByTestId('checkout-btn')).toBeInTheDocument();
    });

    it('handles portal configuration correctly', async () => {
      const portalProps = {
        planId: 'test_plan',
        checkoutProps: {
          portalId: 'custom-portal',
          portalRoot: document.createElement('div'),
        },
      };

      render(<CheckoutButton {...portalProps} />);

      await userEvent.click(screen.getByText('Checkout'));
      await waitFor(() => {
        expect(mockOpenCheckout).toHaveBeenCalledWith(
          expect.objectContaining({ ...portalProps.checkoutProps, planId: portalProps.planId }),
        );
      });
    });
  });
});
