import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// --- Mock state ---

let mockStripe: any = null;
let mockElements: any = null;
const mockInitializePaymentMethod = vi.fn();

vi.mock('../../stripe-react', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PaymentElement: () => null,
  useElements: () => mockElements,
  useStripe: () => mockStripe,
}));

vi.mock('../../hooks/useClerk', () => ({
  useClerk: () => ({
    __internal_getOption: () => undefined,
    __internal_environment: {
      commerceSettings: {
        billing: {
          stripePublishableKey: 'pk_test_123',
        },
      },
      displayConfig: {
        userProfileUrl: 'https://example.com/profile',
        organizationProfileUrl: 'https://example.com/org-profile',
      },
    },
  }),
}));

vi.mock('../useInitializePaymentMethod', () => ({
  __internal_useInitializePaymentMethod: () => ({
    initializedPaymentMethod: {
      externalGatewayId: 'acct_123',
      externalClientSecret: 'seti_123',
      paymentMethodOrder: ['card'],
    },
    initializePaymentMethod: mockInitializePaymentMethod,
  }),
}));

vi.mock('../useStripeClerkLibs', () => ({
  __internal_useStripeClerkLibs: () => ({
    loadStripe: vi.fn().mockResolvedValue({}),
  }),
}));

vi.mock('../useStripeLoader', () => ({
  __internal_useStripeLoader: () => ({}),
}));

const { __experimental_PaymentElementProvider, __experimental_usePaymentElement } = await import('../payment-element');

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <__experimental_PaymentElementProvider>{children}</__experimental_PaymentElementProvider>;
  };
}

describe('usePaymentElement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStripe = null;
    mockElements = null;
  });

  describe('when provider is not ready (no stripe/elements)', () => {
    it('returns isProviderReady=false and isFormReady=false', () => {
      const { result } = renderHook(() => __experimental_usePaymentElement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isProviderReady).toBe(false);
      expect(result.current.isFormReady).toBe(false);
      expect(result.current.provider).toBeUndefined();
    });

    it('submit throws when stripe is not loaded', () => {
      const { result } = renderHook(() => __experimental_usePaymentElement(), {
        wrapper: createWrapper(),
      });

      expect(() => result.current.submit()).toThrow('Clerk: Unable to submit, Stripe libraries are not yet loaded');
    });

    it('reset throws when stripe is not loaded', () => {
      const { result } = renderHook(() => __experimental_usePaymentElement(), {
        wrapper: createWrapper(),
      });

      expect(() => result.current.reset()).toThrow('Clerk: Unable to submit, Stripe libraries are not yet loaded');
    });
  });

  describe('when provider is ready', () => {
    beforeEach(() => {
      mockStripe = {
        confirmSetup: vi.fn(),
      };
      mockElements = {
        create: vi.fn(),
        update: vi.fn(),
      };
    });

    it('returns isProviderReady=true with stripe provider info', () => {
      const { result } = renderHook(() => __experimental_usePaymentElement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isProviderReady).toBe(true);
      expect(result.current.provider).toEqual({ name: 'stripe' });
    });

    it('submit returns paymentToken on successful confirmSetup', async () => {
      mockStripe.confirmSetup.mockResolvedValue({
        setupIntent: { payment_method: 'pm_test_123' },
        error: null,
      });

      const { result } = renderHook(() => __experimental_usePaymentElement(), {
        wrapper: createWrapper(),
      });

      let submitResult: any;
      await act(async () => {
        submitResult = await result.current.submit();
      });

      expect(mockStripe.confirmSetup).toHaveBeenCalledWith({
        elements: mockElements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });
      expect(submitResult).toEqual({
        data: { gateway: 'stripe', paymentToken: 'pm_test_123' },
        error: null,
      });
    });

    it('submit returns structured error when confirmSetup fails', async () => {
      mockStripe.confirmSetup.mockResolvedValue({
        setupIntent: null,
        error: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card was declined.',
        },
      });

      const { result } = renderHook(() => __experimental_usePaymentElement(), {
        wrapper: createWrapper(),
      });

      let submitResult: any;
      await act(async () => {
        submitResult = await result.current.submit();
      });

      expect(submitResult).toEqual({
        data: null,
        error: {
          gateway: 'stripe',
          error: {
            type: 'card_error',
            code: 'card_declined',
            message: 'Your card was declined.',
          },
        },
      });
    });

    it('submit handles validation_error type from confirmSetup', async () => {
      mockStripe.confirmSetup.mockResolvedValue({
        setupIntent: null,
        error: {
          type: 'validation_error',
          message: 'Your card number is incomplete.',
        },
      });

      const { result } = renderHook(() => __experimental_usePaymentElement(), {
        wrapper: createWrapper(),
      });

      let submitResult: any;
      await act(async () => {
        submitResult = await result.current.submit();
      });

      expect(submitResult).toEqual({
        data: null,
        error: {
          gateway: 'stripe',
          error: {
            type: 'validation_error',
            code: undefined,
            message: 'Your card number is incomplete.',
          },
        },
      });
    });

    it('reset calls initializePaymentMethod', async () => {
      mockInitializePaymentMethod.mockResolvedValue({
        externalClientSecret: 'seti_new_456',
        gateway: 'stripe',
      });

      const { result } = renderHook(() => __experimental_usePaymentElement(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.reset();
      });

      expect(mockInitializePaymentMethod).toHaveBeenCalledTimes(1);
    });
  });
});
