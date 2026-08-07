import type { ReactElement } from 'react';

/** A single credit/discount line rendered under a statement item, reduced to display strings. */
export interface StatementDetailAdjustment {
  id: string;
  label: string;
  /** Formatted amount already wrapped for display, e.g. `"($5.00)"`. */
  value: string;
}

/** One charge within a statement group, reduced to a Clerk-free display model. */
export interface StatementDetailItem {
  id: string;
  planName: string;
  /** Plan price and period, e.g. `"$30.00 / Month"`. */
  planDescription: string;
  /** Formatted charge total, e.g. `"$30.00"`. */
  amountLabel: string;
  /** Sentence describing the charge, e.g. `"Paid for Pro month plan"`. */
  caption: string;
  viewPaymentLabel: string;
  /** Navigates to the payment attempt behind this charge. */
  onViewPayment: () => void;
  adjustments: StatementDetailAdjustment[];
}

/** A dated group of charges within a statement. */
export interface StatementDetailSection {
  id: string;
  /** Group date, e.g. `"March 15, 2026"`. */
  dateLabel: string;
  items: StatementDetailItem[];
}

export interface OrganizationBillingStatementDetailViewProps {
  /** Statement month/year, e.g. `"March 2026"`. */
  title: string;
  /** Truncated statement id shown under the title. */
  idLabel: string;
  /** Statement status, e.g. `"Open"`. */
  statusLabel: string;
  backLabel: string;
  /** Navigates back to the statements list. */
  onBack: () => void;
  sections: StatementDetailSection[];
  /** Footer total label, e.g. `"Total paid"`. */
  totalLabel: string;
  /** Formatted grand total, e.g. `"$50.00"`. */
  totalValue: string;
  /** Currency code shown alongside the total, e.g. `"USD"`. */
  currency: string;
}

/**
 * Renders a billing statement's detail from controller-derived props. Rendering only — it receives
 * every string and callback and never touches Clerk. Deliberately unstyled native markup: the
 * migration is focused on the controller, not the visual layer.
 */
export function OrganizationBillingStatementDetailView({
  title,
  idLabel,
  statusLabel,
  backLabel,
  onBack,
  sections,
  totalLabel,
  totalValue,
  currency,
}: OrganizationBillingStatementDetailViewProps): ReactElement {
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
        <span>{statusLabel}</span>
      </header>
      {sections.map(section => (
        <section key={section.id}>
          <h2>{section.dateLabel}</h2>
          {section.items.map(item => (
            <div key={item.id}>
              <span>{item.planName}</span>
              <span>{item.planDescription}</span>
              <span>{item.amountLabel}</span>
              <ul>
                <li>
                  <span>{item.caption}</span>
                  <button
                    type='button'
                    onClick={item.onViewPayment}
                  >
                    {item.viewPaymentLabel}
                  </button>
                </li>
                {item.adjustments.map(adjustment => (
                  <li key={adjustment.id}>
                    <span>{adjustment.label}</span>
                    <span>{adjustment.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
      <footer>
        <span>{totalLabel}</span>
        <span>{currency}</span>
        <span>{totalValue}</span>
      </footer>
    </article>
  );
}
