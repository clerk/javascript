import '@testing-library/jest-dom/vitest';

import type { Theme } from '@clerk/ui/internal';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '../../hooks';
import { SubscriptionDetailsButton } from '../SubscriptionDetailsButton';

// Mock the useAuth hook
vi.mock('../../hooks', () => ({
  useAuth: vi.fn(),
}));

const mockOpenSubscriptionDetails = vi.fn();

const mockClerk = {
  __internal_openSubscriptionDetails: mockOpenSubscriptionDetails,
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

describe('SubscriptionDetailsButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication Validation', () => {
    it('throws error when rendered without authenticated user', () => {
      // Mock useAuth to return null userId
      (useAuth as any).mockReturnValue({ userId: null, orgId: null });

      // Expect the component to throw an error
      expect(() => render(<SubscriptionDetailsButton />)).toThrow(
        'Ensure that `<SubscriptionDetailsButton />` is rendered inside a `<SignedIn />` component.',
      );
    });

    it('throws error when using org subscriber type without active organization', () => {
      // Mock useAuth to return userId but no orgId
      (useAuth as any).mockReturnValue({ userId: 'user_123', orgId: null });

      // Expect the component to throw an error when for="organization"
      expect(() => render(<SubscriptionDetailsButton for='organization' />)).toThrow(
        'Wrap `<SubscriptionDetailsButton for="organization" />` with a check for an active organization. Retrieve `orgId` from `useAuth()` and confirm it is defined.',
      );
    });

    it('renders successfully with authenticated user', () => {
      // Mock useAuth to return valid userId
      (useAuth as any).mockReturnValue({ userId: 'user_123', orgId: null });

      // Component should render without throwing
      expect(() => render(<SubscriptionDetailsButton />)).not.toThrow();
    });

    it('renders successfully with org subscriber type when organization is active', () => {
      // Mock useAuth to return both userId and orgId
      (useAuth as any).mockReturnValue({ userId: 'user_123', orgId: 'org_123' });

      // Component should render without throwing
      expect(() => render(<SubscriptionDetailsButton for='organization' />)).not.toThrow();
    });
  });

  describe('Rendering', () => {
    beforeEach(() => {
      // Set up valid authentication for all rendering tests
      (useAuth as any).mockReturnValue({ userId: 'user_123', orgId: null });
    });

    it('renders with default "Subscription details" text when no children provided', () => {
      render(<SubscriptionDetailsButton />);

      expect(screen.getByText('Subscription details')).toBeInTheDocument();
    });

    it('renders custom button content when provided', () => {
      render(
        <SubscriptionDetailsButton>
          <button>View Subscription</button>
        </SubscriptionDetailsButton>,
      );

      expect(screen.getByText('View Subscription')).toBeInTheDocument();
    });

    it('passes additional props to child element', () => {
      render(
        <SubscriptionDetailsButton data-testid='subscription-btn'>
          <button>Subscription details</button>
        </SubscriptionDetailsButton>,
      );

      expect(screen.getByTestId('subscription-btn')).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      // Set up valid authentication for all event tests
      (useAuth as any).mockReturnValue({ userId: 'user_123', orgId: null });
    });

    it('calls clerk.__internal_openSubscriptionDetails with correct props when clicked', async () => {
      const onSubscriptionCancel = vi.fn();
      const props = {
        for: 'user' as const,
        onSubscriptionCancel,
        subscriptionDetailsProps: {
          appearance: {} as Theme,
        },
      };

      render(<SubscriptionDetailsButton {...props} />);

      await userEvent.click(screen.getByText('Subscription details'));

      await waitFor(() => {
        expect(mockOpenSubscriptionDetails).toHaveBeenCalledWith(
          expect.objectContaining({
            ...props.subscriptionDetailsProps,
            for: props.for,
            onSubscriptionCancel: props.onSubscriptionCancel,
          }),
        );
      });
    });

    it('executes child onClick handler before opening subscription details', async () => {
      const childOnClick = vi.fn();

      render(
        <SubscriptionDetailsButton>
          <button onClick={childOnClick}>Custom Button</button>
        </SubscriptionDetailsButton>,
      );

      await userEvent.click(screen.getByText('Custom Button'));

      await waitFor(() => {
        expect(childOnClick).toHaveBeenCalled();
        expect(mockOpenSubscriptionDetails).toHaveBeenCalled();
      });
    });

    it('calls onSubscriptionCancel when provided', async () => {
      const onSubscriptionCancel = vi.fn();

      render(
        <SubscriptionDetailsButton onSubscriptionCancel={onSubscriptionCancel}>
          <button>Cancel Subscription</button>
        </SubscriptionDetailsButton>,
      );

      await userEvent.click(screen.getByText('Cancel Subscription'));

      await waitFor(() => {
        expect(mockOpenSubscriptionDetails).toHaveBeenCalledWith(expect.objectContaining({ onSubscriptionCancel }));
      });
    });
  });

  describe('Portal Configuration', () => {
    beforeEach(() => {
      // Set up valid authentication for portal tests
      (useAuth as any).mockReturnValue({ userId: 'user_123', orgId: null });
    });

    it('handles portal configuration correctly', async () => {
      const portalProps = {
        subscriptionDetailsProps: {
          portalId: 'custom-portal',
          portalRoot: document.createElement('div'),
        },
      };

      render(<SubscriptionDetailsButton {...portalProps} />);

      await userEvent.click(screen.getByText('Subscription details'));

      await waitFor(() => {
        expect(mockOpenSubscriptionDetails).toHaveBeenCalledWith(
          expect.objectContaining({
            ...portalProps.subscriptionDetailsProps,
          }),
        );
      });
    });
  });
});
