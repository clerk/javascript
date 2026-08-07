import type { ReactElement } from 'react';

/** Visual treatment for a payment's status, mapped from the resource status by the controller. */
export type PaymentAttemptStatusIntent = 'success' | 'danger' | 'primary';

/** A single payment attempt, reduced to plain display strings the view renders without Clerk. */
export interface PaymentAttemptRow {
  id: string;
  /** Full payment date, e.g. `"March 15, 2026"`. */
  dateLabel: string;
  /** Truncated payment id shown under the date. */
  idLabel: string;
  /** Formatted amount, e.g. `"$50.00"`. */
  amountLabel: string;
  /** Capitalized status, e.g. `"Paid"`. */
  statusLabel: string;
  /** Status intent, carried for later styling; the unstyled view exposes it as a data attribute. */
  statusIntent: PaymentAttemptStatusIntent;
}

export interface OrganizationBillingPaymentsSectionViewProps {
  /** Table header labels (date / amount / status). */
  columnHeaders: { date: string; amount: string; status: string };
  /** Payment rows already reduced to a Clerk-free model. */
  rows: PaymentAttemptRow[];
  /** Copy shown when there are no payments. */
  emptyLabel: string;
  /** Navigates to a payment attempt's detail screen. */
  onSelectRow: (id: string) => void;
}

/**
 * Renders the organization billing payment-attempts list from controller-derived props. Rendering
 * only — it receives every string and callback and never touches Clerk. Deliberately unstyled native
 * markup: the migration is focused on the controller, not the visual layer.
 */
export function OrganizationBillingPaymentsSectionView({
  columnHeaders,
  rows,
  emptyLabel,
  onSelectRow,
}: OrganizationBillingPaymentsSectionViewProps): ReactElement {
  return (
    <table>
      <thead>
        <tr>
          <th>{columnHeaders.date}</th>
          <th>{columnHeaders.amount}</th>
          <th>{columnHeaders.status}</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={3}>{emptyLabel}</td>
          </tr>
        ) : (
          rows.map(row => (
            <tr
              key={row.id}
              onClick={() => onSelectRow(row.id)}
            >
              <td>
                <span>{row.dateLabel}</span>
                <span>{row.idLabel}</span>
              </td>
              <td>{row.amountLabel}</td>
              <td>
                <span data-intent={row.statusIntent}>{row.statusLabel}</span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
