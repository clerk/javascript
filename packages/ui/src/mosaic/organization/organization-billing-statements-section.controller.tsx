import { useStatements } from '@/contexts';
import { useRouter } from '@/router';
import { truncateWithEndVisible } from '@/utils/truncateTextWithEndVisible';

import { formatMoney, formatMonthYear } from './billing-format';
import type { StatementRow } from './organization-billing-statements-section.view';

type OrganizationBillingStatementsSectionController =
  | { status: 'loading' }
  | {
      status: 'ready';
      /** Table header labels (date / amount). */
      columnHeaders: { date: string; amount: string };
      rows: StatementRow[];
      /** Copy shown when there are no statements. */
      emptyLabel: string;
      /** Navigates to a statement's detail screen. */
      onSelectRow: (id: string) => void;
    };

export function useOrganizationBillingStatementsSectionController(): OrganizationBillingStatementsSectionController {
  const { data: statements, isLoading } = useStatements();
  const { navigate } = useRouter();

  // First load with nothing to show yet — mirror the sibling sections' skeleton gate.
  if (isLoading && statements.length === 0) {
    return { status: 'loading' };
  }

  return {
    status: 'ready',
    columnHeaders: { date: 'Date', amount: 'Amount' },
    rows: statements.map(statement => ({
      id: statement.id,
      dateLabel: formatMonthYear(statement.timestamp),
      idLabel: truncateWithEndVisible(statement.id),
      amountLabel: formatMoney(statement.totals.grandTotal),
    })),
    emptyLabel: 'No statements to display',
    onSelectRow: id => void navigate(`statement/${id}`),
  };
}
