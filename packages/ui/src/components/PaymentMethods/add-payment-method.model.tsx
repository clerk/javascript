import type { PaymentElementCheckoutData } from '@clerk/shared/react';
import {
  __experimental_PaymentElement as PaymentElement,
  __experimental_PaymentElementProvider as PaymentElementProvider,
  __experimental_usePaymentElement as usePaymentElement,
  __internal_useOrganizationBase,
  useClerk,
  useSafeLayoutEffect,
  useSession,
  useUser,
} from '@clerk/shared/react';
import type { PropsWithChildren, ReactNode } from 'react';
import { useMemo, useRef } from 'react';

import { resolveComputedCSSColor, resolveComputedCSSProperty } from '@/ui/utils/cssVariables';

import { useSubscriberTypeContext, useSubscriberTypeLocalizationRoot } from '../../contexts';
import { localizationKeys, useAppearance, useLocalizations } from '../../customizables';
import { useAddPaymentMethodContext } from './add-payment-method.context';
import type {
  AddPaymentMethodFormModel,
  AddPaymentMethodProps,
  AddPaymentMethodRootModel,
} from './add-payment-method.types';
import type { PaymentToken } from './payment-methods.types';

const useStripeAppearance = (node: HTMLElement | null) => {
  const theme = useAppearance().parsedInternalTheme;

  return useMemo(() => {
    if (!node) {
      return undefined;
    }
    const { colors, fontWeights, fontSizes, radii, space } = theme;
    return {
      colorPrimary: resolveComputedCSSColor(node, colors.$primary500, colors.$colorBackground),
      colorBackground: resolveComputedCSSColor(node, colors.$colorInput, colors.$colorBackground),
      colorText: resolveComputedCSSColor(node, colors.$colorForeground, colors.$colorBackground),
      colorTextSecondary: resolveComputedCSSColor(node, colors.$colorMutedForeground, colors.$colorBackground),
      colorSuccess: resolveComputedCSSColor(node, colors.$success500, colors.$colorBackground),
      colorDanger: resolveComputedCSSColor(node, colors.$danger500, colors.$colorBackground),
      colorWarning: resolveComputedCSSColor(node, colors.$warning500, colors.$colorBackground),
      fontWeightNormal: resolveComputedCSSProperty(node, 'font-weight', fontWeights.$normal.toString()),
      fontWeightMedium: resolveComputedCSSProperty(node, 'font-weight', fontWeights.$medium.toString()),
      fontWeightBold: resolveComputedCSSProperty(node, 'font-weight', fontWeights.$bold.toString()),
      fontSizeXl: resolveComputedCSSProperty(node, 'font-size', fontSizes.$xl),
      fontSizeLg: resolveComputedCSSProperty(node, 'font-size', fontSizes.$lg),
      fontSizeSm: resolveComputedCSSProperty(node, 'font-size', fontSizes.$md),
      fontSizeXs: resolveComputedCSSProperty(node, 'font-size', fontSizes.$sm),
      borderRadius: resolveComputedCSSProperty(node, 'border-radius', radii.$lg),
      spacingUnit: resolveComputedCSSProperty(node, 'padding', space.$1),
    };
  }, [theme, node]);
};

const usePaymentMethodRequestScope = (target = '') => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const organization = __internal_useOrganizationBase();
  const subscriberType = useSubscriberTypeContext();
  const userId = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const subjectId = subscriberType === 'organization' ? organization?.id : userId;
  const identity = JSON.stringify([userId, sessionId, clientId, subscriberType, subjectId, target]);
  const current = useRef({ identity, version: 0 });
  if (current.current.identity !== identity) {
    current.current = { identity, version: current.current.version + 1 };
  }
  const owner = current.current;
  const mounted = useRef(true);
  useSafeLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return {
    requestKey: JSON.stringify([identity, owner.version]),
    canRun: () =>
      mounted.current &&
      current.current === owner &&
      !!userId &&
      !!subjectId &&
      clerk.user?.id === userId &&
      clerk.session?.id === sessionId &&
      clerk.client?.id === clientId &&
      (subscriberType === 'organization' ? clerk.organization : clerk.user)?.id === subjectId,
  };
};

export const useAddPaymentMethodRootModel = (
  props: Pick<AddPaymentMethodProps, 'checkout' | 'requestKey'>,
): AddPaymentMethodRootModel => {
  const checkout = props.checkout ? projectPaymentElementCheckout(props.checkout) : undefined;
  const scope = usePaymentMethodRequestScope(JSON.stringify([props.requestKey, checkout]));
  const subscriberType = useSubscriberTypeContext();
  const stripeAppearanceNode = useRef<HTMLDivElement | null>(null);
  const { t } = useLocalizations();
  const stripeAppearance = useStripeAppearance(stripeAppearanceNode.current);

  return {
    requestKey: scope.requestKey,
    checkout,
    subscriberType,
    stripeAppearanceNode,
    stripeAppearance,
    paymentDescription: t(
      localizationKeys(
        checkout?.planPeriod === 'month'
          ? 'billing.paymentMethod.applePayDescription.monthly'
          : 'billing.paymentMethod.applePayDescription.annual',
      ),
    ),
  };
};

export const useAddPaymentMethodFormModel = (): AddPaymentMethodFormModel => {
  const { headerTitle, headerSubtitle, submitLabel, hasCheckout, onSuccess, cancelAction } =
    useAddPaymentMethodContext();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const scope = usePaymentMethodRequestScope();
  const { isFormReady, isProviderReady, submit, reset } = usePaymentElement();
  const current = useRef({
    key: scope.requestKey,
    submit,
    reset,
    version: 0,
    token: undefined as PaymentToken | undefined,
  });
  if (
    current.current.key !== scope.requestKey ||
    current.current.submit !== submit ||
    current.current.reset !== reset
  ) {
    current.current.token = undefined;
    current.current = { key: scope.requestKey, submit, reset, version: current.current.version + 1, token: undefined };
  }
  const owner = current.current;
  const latestSuccess = useRef(onSuccess);
  latestSuccess.current = onSuccess;
  const canRun = () => current.current === owner && scope.canRun();
  useSafeLayoutEffect(
    () => () => {
      owner.token = undefined;
    },
    [owner],
  );

  return {
    headerTitle,
    headerSubtitle,
    submitLabel,
    hasCheckout,
    cancelAction,
    localizationRoot,
    isProviderReady,
    isFormReady,
    requestKey: JSON.stringify([scope.requestKey, owner.version]),
    canRun,
    submit: async canContinue => {
      const isCurrent = () => canRun() && canContinue();
      if (!isCurrent() || !isFormReady) {
        return { status: 'cancelled' };
      }
      owner.token = undefined;
      const result = await submit();
      if (!isCurrent()) {
        return { status: 'cancelled' };
      }
      if (result.error) {
        return result.error.error.type === 'validation_error'
          ? { status: 'validation_error' }
          : { status: 'error', message: result.error.error.message };
      }
      owner.token = { gateway: result.data.gateway, paymentToken: result.data.paymentToken };
      return { status: 'ready' };
    },
    complete: async canContinue => {
      const isCurrent = () => canRun() && canContinue();
      const token = owner.token;
      owner.token = undefined;
      if (!isCurrent() || !token) {
        return false;
      }
      await latestSuccess.current(token, isCurrent);
      return isCurrent();
    },
    reset: async canContinue => {
      owner.token = undefined;
      if (canRun() && canContinue()) {
        await reset();
      }
    },
  };
};

export function projectPaymentElementCheckout(checkout: PaymentElementCheckoutData): PaymentElementCheckoutData {
  return {
    plan: checkout.plan ? { name: checkout.plan.name } : checkout.plan,
    totals: checkout.totals
      ? {
          grandTotal: { amount: checkout.totals.grandTotal.amount },
          totalDueNow: checkout.totals.totalDueNow
            ? { amount: checkout.totals.totalDueNow.amount }
            : checkout.totals.totalDueNow,
        }
      : undefined,
    planPeriod: checkout.planPeriod,
  };
}

export function AddPaymentMethodProvider({ model, children }: PropsWithChildren<{ model: AddPaymentMethodRootModel }>) {
  return (
    <>
      <div
        ref={model.stripeAppearanceNode}
        style={{ display: 'none' }}
      />
      <PaymentElementProvider
        checkout={model.checkout}
        for={model.subscriberType}
        stripeAppearance={model.stripeAppearance}
        paymentDescription={model.paymentDescription}
      >
        {children}
      </PaymentElementProvider>
    </>
  );
}

export function AddPaymentMethodElement({ fallback }: { fallback: ReactNode }) {
  return <PaymentElement fallback={fallback} />;
}
