import type { ReactElement } from 'react';

/** A single billing statement, reduced to plain display strings the view renders without Clerk. */
export interface StatementRow {
  id: string;
  /** Statement month/year, e.g. `"March 2026"`. */
  dateLabel: string;
  /** Truncated statement id shown under the date. */
  idLabel: string;
  /** Formatted grand total, e.g. `"$50.00"`. */
  amountLabel: string;
}

export interface OrganizationBillingStatementsSectionViewProps {
  /** Table header labels (date / amount). */
  columnHeaders: { date: string; amount: string };
  /** Statement rows already reduced to a Clerk-free model. */
  rows: StatementRow[];
  /** Copy shown when there are no statements. */
  emptyLabel: string;
  /** Navigates to a statement's detail screen. */
  onSelectRow: (id: string) => void;
}

/**
 * Renders the organization billing statements list from controller-derived props. Rendering only —
 * it receives every string and callback and never touches Clerk. Deliberately unstyled native
 * markup: the migration is focused on the controller, not the visual layer.
 */
export function OrganizationBillingStatementsSectionView({
  columnHeaders,
  rows,
  emptyLabel,
  onSelectRow,
}: OrganizationBillingStatementsSectionViewProps): ReactElement {
  return (
    <table>
      <thead>
        <tr>
          <th>{columnHeaders.date}</th>
          <th>{columnHeaders.amount}</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={2}>{emptyLabel}</td>
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
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
