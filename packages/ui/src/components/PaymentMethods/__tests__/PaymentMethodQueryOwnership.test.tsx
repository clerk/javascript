import type { BillingPaymentMethodResource, ClerkPaginatedResponse } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook, waitFor } from '@/test/utils';
import { SubscriberTypeContext } from '@/ui/contexts';

import { usePaymentMethodsModel } from '../payment-methods.model';

const { createFixtures } = bindCreateFixtures('UserProfile');

const paymentMethod = (id: string) =>
  ({
    id,
    paymentType: 'card',
    cardType: 'visa',
    last4: '4242',
    status: 'active',
    isDefault: false,
    isRemovable: true,
    remove: vi.fn().mockResolvedValue(undefined),
    makeDefault: vi.fn().mockResolvedValue(undefined),
  }) as unknown as BillingPaymentMethodResource;

describe('Payment method query ownership', () => {
  it.each(['user', 'organization'] as const)(
    'does not expose previous %s payment methods while the new account loads',
    async payer => {
      const { wrapper: Fixture, fixtures } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: payer === 'organization' ? ['org_first'] : undefined,
        });
        if (payer === 'organization') {
          f.withOrganizations();
        }
        f.withBilling();
      });
      vi.spyOn(fixtures.clerk.session!, 'checkAuthorization').mockReturnValue(true);
      const wrapper = ({ children }: PropsWithChildren) => (
        <Fixture>
          <SubscriberTypeContext.Provider value={payer}>{children}</SubscriberTypeContext.Provider>
        </Fixture>
      );
      const resource = payer === 'organization' ? fixtures.clerk.organization! : fixtures.clerk.user!;
      const oldMethod = paymentMethod('old_method');
      resource.getPaymentMethods.mockResolvedValue({ data: [oldMethod], total_count: 1 });
      const { result, rerender } = renderHook(usePaymentMethodsModel, { wrapper });
      await waitFor(() => expect(result.current.paymentMethods.map(item => item.id)).toEqual(['old_method']));
      const retained = result.current.paymentMethods[0];
      const completion = createDeferredPromise<ClerkPaginatedResponse<BillingPaymentMethodResource>>();
      const getPaymentMethods = vi.fn().mockReturnValue(completion.promise);
      const replacement = { ...resource, id: `${payer}_second`, getPaymentMethods };
      vi.spyOn(fixtures.clerk, payer, 'get').mockReturnValue(replacement);
      fixtures.clerk.__internal_lastEmittedResources = {
        ...fixtures.clerk.__internal_lastEmittedResources!,
        [payer]: replacement,
      };
      rerender();
      await waitFor(() => expect(getPaymentMethods).toHaveBeenCalledOnce());
      expect(result.current.paymentMethods).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      await expect(retained.remove()).rejects.toMatchObject({ code: 'billing_subject_changed' });
      expect(oldMethod.remove).not.toHaveBeenCalled();
      const newMethod = paymentMethod('new_method');
      await act(async () => {
        completion.resolve({ data: [newMethod], total_count: 1 });
        await completion.promise;
      });
      await waitFor(() => expect(result.current.paymentMethods.map(item => item.id)).toEqual(['new_method']));
      await expect(result.current.paymentMethods[0].remove()).resolves.toBe(true);
      expect(newMethod.remove).toHaveBeenCalledExactlyOnceWith({
        orgId: payer === 'organization' ? replacement.id : undefined,
      });
      expect(oldMethod.remove).not.toHaveBeenCalled();
    },
  );
});
