// In-memory routing for composed billing — intentionally not URL-backed. The
// consumer owns the page URL, so we don't touch hash/history. Trade-off:
// back/forward, refresh, and deep-links don't preserve sub-route or tab state.
import { useMemo, useState } from 'react';

import type { RouteContextValue } from '../router/RouteContext';
import { stubRouter } from './stubRouter';

type BillingRoute =
  | { page: 'billing' }
  | { page: 'plans' }
  | { page: 'statement'; statementId: string }
  | { page: 'payment-attempt'; paymentAttemptId: string };

function resolveNavigation(to: string): BillingRoute {
  let path = to;
  while (path.startsWith('../')) {
    path = path.slice(3);
  }

  if (!path || path === '/') {
    return { page: 'billing' };
  }

  if (path === 'plans') {
    return { page: 'plans' };
  }

  const statementMatch = path.match(/^statement\/(.+)$/);
  if (statementMatch) {
    return { page: 'statement', statementId: statementMatch[1] };
  }

  const paymentMatch = path.match(/^payment-attempt\/(.+)$/);
  if (paymentMatch) {
    return { page: 'payment-attempt', paymentAttemptId: paymentMatch[1] };
  }

  return { page: 'billing' };
}

function pathFromRoute(route: BillingRoute): string {
  switch (route.page) {
    case 'plans':
      return 'billing/plans';
    case 'statement':
      return `billing/statement/${route.statementId}`;
    case 'payment-attempt':
      return `billing/payment-attempt/${route.paymentAttemptId}`;
    default:
      return 'billing';
  }
}

function paramsFromRoute(route: BillingRoute): Record<string, string> {
  switch (route.page) {
    case 'statement':
      return { statementId: route.statementId };
    case 'payment-attempt':
      return { paymentAttemptId: route.paymentAttemptId };
    default:
      return {};
  }
}

export function useBillingRouter(): { router: RouteContextValue; route: BillingRoute } {
  const [route, setRoute] = useState<BillingRoute>({ page: 'billing' });
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});

  const router: RouteContextValue = useMemo(
    () => ({
      ...stubRouter,
      currentPath: pathFromRoute(route),
      params: paramsFromRoute(route),
      queryParams,
      queryString: new URLSearchParams(queryParams).toString(),
      navigate: async (to: string, options?: { searchParams?: URLSearchParams }) => {
        try {
          const url = new URL(to);
          if (url.origin !== window.location.origin) {
            window.location.href = to;
            return;
          }
        } catch {}
        const newRoute = resolveNavigation(to);
        setRoute(newRoute);
        if (options?.searchParams) {
          setQueryParams(Object.fromEntries(options.searchParams.entries()));
        } else if (newRoute.page !== route.page) {
          setQueryParams({});
        }
      },
    }),
    [route, queryParams],
  );

  return { router, route };
}
