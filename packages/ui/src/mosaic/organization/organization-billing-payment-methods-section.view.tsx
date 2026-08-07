import type { ReactElement } from 'react';

/** A single payment method, reduced to plain display strings the view renders without Clerk. */
export interface PaymentMethodRow {
  id: string;
  /** Capitalized type, e.g. `"Visa"` or `"Paypal"`. */
  typeLabel: string;
  /** Card tail, e.g. `"⋯ 4242"`; empty for non-card methods. */
  detailLabel: string;
  /** Confirmation copy passed to the remove flow, e.g. `"visa ⋯ 4242"`. */
  label: string;
  isDefault: boolean;
  isExpired: boolean;
  /** Whether the remove action is permitted for this method. */
  isRemovable: boolean;
}

/** The remove-confirmation dialog state, flattened from the remove machine by the controller. */
export interface PaymentMethodRemoveState {
  open: boolean;
  /** Label of the method being removed, e.g. `"visa ⋯ 4242"`. */
  label: string;
  error: string | null;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** The add-payment-method flow state, flattened from the add machine by the controller. */
export interface PaymentMethodAddState {
  /** Whether the add entry point is offered at all (false in no-RHC builds). */
  available: boolean;
  open: boolean;
  submitting: boolean;
  error: string | null;
  onOpen: () => void;
  onCancel: () => void;
  /** The token seam: the gateway's card element hands its tokenized method back here. */
  onSubmit: (token: { gateway: string; paymentToken: string }) => void;
}

export interface OrganizationBillingPaymentMethodsSectionViewProps {
  title: string;
  rows: PaymentMethodRow[];
  /** Id of the method whose make-default call is in flight, or `null`. */
  makeDefaultPendingId: string | null;
  /** Error from the last make-default attempt, shown at section level. */
  makeDefaultError: string | null;
  onMakeDefault: (id: string) => void;
  /** Opens the remove confirmation for a row. */
  onRemove: (row: PaymentMethodRow) => void;
  remove: PaymentMethodRemoveState;
  add: PaymentMethodAddState;
}

/**
 * Renders the organization billing payment-methods list from controller-derived props. Rendering
 * only — it receives every string and callback and never touches Clerk. Deliberately unstyled native
 * markup: the migration is focused on the controller and its mutation machines, not the visual layer.
 */
export function OrganizationBillingPaymentMethodsSectionView({
  title,
  rows,
  makeDefaultPendingId,
  makeDefaultError,
  onMakeDefault,
  onRemove,
  remove,
  add,
}: OrganizationBillingPaymentMethodsSectionViewProps): ReactElement {
  return (
    <section>
      <h2>{title}</h2>
      {makeDefaultError ? <p role='alert'>{makeDefaultError}</p> : null}
      <ul>
        {rows.map(row => (
          <li
            key={row.id}
            data-default={row.isDefault}
            data-expired={row.isExpired}
          >
            <span>{row.typeLabel}</span>
            {row.detailLabel ? <span>{row.detailLabel}</span> : null}
            {row.isDefault ? <span data-badge='default'>Default</span> : null}
            {row.isExpired ? (
              <span
                data-badge='expired'
                data-intent='danger'
              >
                Expired
              </span>
            ) : null}
            {row.isDefault ? null : (
              <button
                type='button'
                onClick={() => onMakeDefault(row.id)}
                disabled={makeDefaultPendingId === row.id}
              >
                Make default
              </button>
            )}
            <button
              type='button'
              onClick={() => onRemove(row)}
              disabled={!row.isRemovable}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {add.available && !add.open ? (
        <button
          type='button'
          onClick={add.onOpen}
        >
          Add payment method
        </button>
      ) : null}
      {add.open ? (
        <div data-testid='add-payment-method'>
          {/* Stripe's PaymentElement (remotely hosted) is not migrated into Mosaic; it stays in the
              legacy user-facing surface. This note stands in for it; `add.onSubmit` is the seam the
              real element would call with its tokenized method. */}
          <p>Card details are collected by the payment provider (not shown here).</p>
          {add.error ? <p role='alert'>{add.error}</p> : null}
          <button
            type='button'
            onClick={add.onCancel}
            disabled={add.submitting}
          >
            Cancel
          </button>
        </div>
      ) : null}
      {remove.open ? (
        <div role='alertdialog'>
          <p>Remove {remove.label}?</p>
          {remove.error ? <p role='alert'>{remove.error}</p> : null}
          <button
            type='button'
            onClick={remove.onConfirm}
            disabled={remove.submitting}
          >
            Remove
          </button>
          <button
            type='button'
            onClick={remove.onCancel}
          >
            Cancel
          </button>
        </div>
      ) : null}
    </section>
  );
}
