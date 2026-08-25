import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import type { BadgeProps } from '../components/badge';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Section } from '../components/section';
import { styles } from './organization-profile-billing.styles';

export interface OrganizationProfileInvoice {
  id: string;
  dateLabel: string;
  invoiceLabel: string;
  amountLabel: string;
  statusLabel: string;
  statusColor?: BadgeProps['color'];
}

export interface OrganizationProfileInvoicesPagination {
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions?: readonly number[];
}

export interface OrganizationProfileInvoicesSectionViewProps {
  invoices: OrganizationProfileInvoice[];
  pagination?: OrganizationProfileInvoicesPagination;
  onDownloadAll?: () => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onView?: (id: string) => void;
}

export function OrganizationProfileInvoicesSectionView({
  invoices,
  pagination,
  onDownloadAll,
  onPageChange,
  onPageSizeChange,
  onView,
}: OrganizationProfileInvoicesSectionViewProps): ReactElement {
  return (
    <Section.Root>
      <div {...stylex.props(styles.sectionHeading)}>
        <Section.Title>Invoices</Section.Title>
        {onDownloadAll ? (
          <Button
            color='neutral'
            size='sm'
            variant='outline'
            onClick={onDownloadAll}
          >
            Download all
          </Button>
        ) : null}
      </div>
      <div {...stylex.props(styles.shell)}>
        {/* TODO: Temporary inline table; replace with Mosaic Table while preserving the invoice columns and overflow. */}
        <div {...stylex.props(styles.tableScroller)}>
          <table {...stylex.props(styles.table)}>
            <thead {...stylex.props(styles.header)}>
              <tr>
                <th
                  scope='col'
                  {...stylex.props(styles.headerCell, styles.invoiceColumn)}
                >
                  Invoice
                </th>
                <th
                  scope='col'
                  {...stylex.props(styles.headerCell)}
                >
                  Amount
                </th>
                <th
                  scope='col'
                  {...stylex.props(styles.headerCell, styles.statusColumn)}
                >
                  Status
                </th>
                <th
                  aria-label='Actions'
                  scope='col'
                  {...stylex.props(styles.headerCell, styles.viewColumn)}
                />
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map(invoice => (
                  <tr
                    key={invoice.id}
                    {...stylex.props(styles.row)}
                  >
                    <td {...stylex.props(styles.cell)}>
                      <div {...stylex.props(styles.invoiceLabel)}>{invoice.dateLabel}</div>
                      <div {...stylex.props(styles.invoiceId)}>{invoice.invoiceLabel}</div>
                    </td>
                    <td {...stylex.props(styles.cell, styles.amountCell)}>{invoice.amountLabel}</td>
                    <td {...stylex.props(styles.cell)}>
                      <Badge color={invoice.statusColor ?? 'positive'}>{invoice.statusLabel}</Badge>
                    </td>
                    <td {...stylex.props(styles.cell, styles.actionCell)}>
                      {onView ? (
                        <Button
                          color='neutral'
                          size='sm'
                          variant='link'
                          onClick={() => onView(invoice.id)}
                        >
                          View
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr {...stylex.props(styles.row)}>
                  <td
                    colSpan={4}
                    {...stylex.props(styles.emptyCell)}
                  >
                    No invoices yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination ? (
          // TODO: Temporary inline pager; replace with Mosaic Pagination while preserving the callback contract.
          <div {...stylex.props(styles.pagination)}>
            <div {...stylex.props(styles.paginationControls)}>
              <Button
                aria-label='Previous invoice page'
                color='neutral'
                disabled={pagination.page <= 1}
                shape='square'
                size='sm'
                touchTarget={false}
                variant='ghost'
                onClick={() => onPageChange?.(pagination.page - 1)}
              >
                <Icon name='chevron-left' />
              </Button>
              <span {...stylex.props(styles.pageCount)}>
                {pagination.page} of {pagination.pageCount}
              </span>
              <Button
                aria-label='Next invoice page'
                color='neutral'
                disabled={pagination.page >= pagination.pageCount}
                shape='square'
                size='sm'
                touchTarget={false}
                variant='ghost'
                onClick={() => onPageChange?.(pagination.page + 1)}
              >
                <Icon name='chevron-right' />
              </Button>
            </div>
            <label {...stylex.props(styles.pageSizeLabel)}>
              <span>Results per page</span>
              {/* TODO: Temporary native select; replace with Mosaic Select while preserving the page-size options. */}
              <select
                aria-label='Results per page'
                value={pagination.pageSize}
                {...stylex.props(styles.pageSizeSelect)}
                onChange={event => onPageSizeChange?.(Number(event.currentTarget.value))}
              >
                {(pagination.pageSizeOptions ?? [10, 25, 50]).map(pageSize => (
                  <option
                    key={pageSize}
                    value={pageSize}
                  >
                    {pageSize}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </div>
    </Section.Root>
  );
}
