import type { ReactElement } from 'react';

/** Semantic color for the payment status badge; carried so styling can be reintroduced later. */
export type PaymentDetailStatusIntent = 'success' | 'danger' | 'primary';

/** One row in the payment breakdown, reduced to display strings. */
export interface PaymentDetailLineItem {
  id: string;
  title: string;
  /** Optional sub-line under the title, e.g. the seat breakdown. */
  description?: string;
  /** Formatted amount, e.g. `"$30.00"` or `"-$5.00"`. */
  value: string;
}

export interface OrganizationBillingPaymentDetailViewProps {
  /** Payment date, e.g. `"March 15, 2026"`. */
  title: string;
  /** Truncated payment attempt id shown under the title. */
  idLabel: string;
  /** Payment status, e.g. `"Paid"`. */
  statusLabel: string;
  statusIntent: PaymentDetailStatusIntent;
  backLabel: string;
  /** Navigates back to the payments list. */
  onBack: () => void;
  lineItems: PaymentDetailLineItem[];
  /** Footer total label, e.g. `"Total due"`. */
  totalLabel: string;
  /** Formatted total, e.g. `"$30.00"`. */
  totalValue: string;
  /** Currency code shown alongside the total, e.g. `"USD"`. */
  currency: string;
}

/**
 * Renders a payment attempt's detail from controller-derived props. Rendering only — it receives
 * every string and callback and never touches Clerk. Deliberately unstyled native markup: the
 * migration is focused on the controller, not the visual layer.
 */
export function OrganizationBillingPaymentDetailView({
  title,
  idLabel,
  statusLabel,
  statusIntent,
  backLabel,
  onBack,
  lineItems,
  totalLabel,
  totalValue,
  currency,
}: OrganizationBillingPaymentDetailViewProps): ReactElement {
  return (
    <article>
      <header>
        <button
          type='button'
          onClick={onBack}
        >
          {backLabel}
        </button>
        <span>{title}</span>
        <span>{idLabel}</span>
        <span data-intent={statusIntent}>{statusLabel}</span>
      </header>
      <ul>
        {lineItems.map(item => (
          <li key={item.id}>
            <span>{item.title}</span>
            {item.description ? <span>{item.description}</span> : null}
            <span>{item.value}</span>
          </li>
        ))}
      </ul>
      <footer>
        <span>{totalLabel}</span>
        <span>{currency}</span>
        <span>{totalValue}</span>
      </footer>
    </article>
  );
}
