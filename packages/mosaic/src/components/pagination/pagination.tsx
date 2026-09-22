import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { fill } from '../../localization/messages';
import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { rtl } from '../../utils/rtl.styles';
import { Button } from '../button';
import { Icon } from '../icon';
import { Select } from '../select';
import { styles } from './pagination.styles';

export interface PaginationProps extends Omit<MosaicElementProps<'nav'>, 'onChange'> {
  page: number;
  totalItems: number;
  pageSize: number;
  onChange?: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  hasFirstLast?: boolean;
  step?: number;
  siblingCount?: number;
  disabled?: boolean;
  label?: string;
  /** The item range, with `{start}`, `{end}` and `{total}` filled in. */
  rangeLabel?: string;
  pageSizeLabel?: string;
  /** Stands in for `pageSizeLabel` when the pagination is too narrow to carry it. */
  pageSizeLabelCompact?: string;
  firstPageLabel?: string;
  previousPageLabel?: string;
  nextPageLabel?: string;
  lastPageLabel?: string;
}

function atLeast(value: number, min: number): number {
  return Number.isFinite(value) && value > min ? Math.floor(value) : min;
}

const defaultPageSizeOptions = [10, 15, 20, 100];

/**
 * Page navigation for a paged list. Renders the current item range, a results-per-page control,
 * first/previous/next/last controls, and the current page over the total. Pages are 1-based;
 * `onChange` receives the page the user asked for.
 *
 * @example
 * <Pagination page={page} totalItems={120} pageSize={10} onChange={setPage} />
 */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(function MosaicPagination(
  {
    page,
    totalItems,
    pageSize,
    onChange,
    pageSizeOptions = defaultPageSizeOptions,
    onPageSizeChange,
    hasFirstLast = true,
    step = 1,
    siblingCount = 1,
    disabled = false,
    label = 'Pagination',
    rangeLabel = '{start}–{end} of {total}',
    pageSizeLabel = 'Results per page',
    pageSizeLabelCompact = 'Show',
    firstPageLabel = 'First page',
    previousPageLabel = 'Previous page',
    nextPageLabel = 'Next page',
    lastPageLabel = 'Last page',
    xstyle,
    ...rest
  },
  ref,
) {
  const itemsPerPage = atLeast(pageSize, 1);
  const pageStep = atLeast(step, 1);
  const siblings = atLeast(siblingCount, 0);
  const itemCount = atLeast(totalItems, 0);
  const pageCount = Math.max(1, Math.ceil(itemCount / itemsPerPage));
  const current = Math.min(atLeast(page, 1), pageCount);
  const start = itemCount === 0 ? 0 : (current - 1) * itemsPerPage + 1;
  const end = Math.min(current * itemsPerPage, itemCount);
  const pageSizeItems = React.useMemo(() => {
    const sizes = new Set(
      [...pageSizeOptions, itemsPerPage].filter(size => Number.isFinite(size) && size >= 1).map(Math.floor),
    );
    return [...sizes].sort((a, b) => a - b).map(size => ({ value: String(size), label: String(size) }));
  }, [pageSizeOptions, itemsPerPage]);
  const isFirst = current <= 1;
  const isLast = current >= pageCount;
  const goTo = (next: number) => onChange?.(Math.min(Math.max(next, 1), pageCount));

  return (
    <nav
      ref={ref}
      aria-label={label}
      {...mergeStyleProps(
        themeProps('pagination', { disabled, hasFirstLast, siblingCount: siblings }),
        stylex.props(reset.base, styles.root, xstyle),
        rest,
      )}
    >
      <div {...stylex.props(reset.base, styles.layout)}>
        <div {...mergeStyleProps(themeProps('pagination-summary'), stylex.props(reset.base, styles.summary))}>
          <span {...mergeStyleProps(themeProps('pagination-range'), stylex.props(reset.base, styles.text))}>
            {fill(rangeLabel, { start, end, total: itemCount })}
          </span>
          <span
            aria-hidden
            {...mergeStyleProps(themeProps('pagination-divider'), stylex.props(reset.base, styles.divider))}
          />
          <div {...mergeStyleProps(themeProps('pagination-page-size'), stylex.props(reset.base, styles.pageSize))}>
            <span {...stylex.props(reset.base, styles.text, styles.pageSizeLabel)}>{pageSizeLabel}</span>
            <span
              aria-hidden
              {...stylex.props(reset.base, styles.text, styles.pageSizeLabelCompact)}
            >
              {pageSizeLabelCompact}
            </span>
            <Select.Root
              items={pageSizeItems}
              value={String(itemsPerPage)}
              onValueChange={value => onPageSizeChange?.(Number(value))}
            >
              <Select.Trigger
                aria-label={pageSizeLabel}
                disabled={disabled}
                render={props => (
                  <Button
                    color='neutral'
                    variant='outline'
                    size='sm'
                    {...props}
                  />
                )}
              />
              <Select.Popup>
                {pageSizeItems.map(item => (
                  <Select.Option
                    key={item.value}
                    xstyle={styles.pageSizeOption}
                    {...item}
                  />
                ))}
              </Select.Popup>
            </Select.Root>
          </div>
        </div>

        <div {...mergeStyleProps(themeProps('pagination-controls'), stylex.props(reset.base, styles.controls))}>
          <div {...stylex.props(reset.base, styles.controlGroup)}>
            {hasFirstLast ? (
              <Button
                aria-label={firstPageLabel}
                color='neutral'
                variant='outline'
                size='sm'
                shape='square'
                touchTarget={false}
                disabled={disabled || isFirst}
                onClick={() => goTo(1)}
              >
                <Icon
                  name='chevron-double-left'
                  size='sm'
                  xstyle={rtl.mirror}
                />
              </Button>
            ) : null}
            <Button
              aria-label={previousPageLabel}
              color='neutral'
              variant='outline'
              size='sm'
              shape='square'
              touchTarget={false}
              disabled={disabled || isFirst}
              onClick={() => goTo(current - pageStep)}
            >
              <Icon
                name='chevron-left'
                size='sm'
                xstyle={rtl.mirror}
              />
            </Button>
          </div>
          <span {...mergeStyleProps(themeProps('pagination-page-label'), stylex.props(reset.base, styles.pageLabel))}>
            {current}/{pageCount}
          </span>
          <div {...stylex.props(reset.base, styles.controlGroup, styles.controlGroupEnd)}>
            <Button
              aria-label={nextPageLabel}
              color='neutral'
              variant='outline'
              size='sm'
              shape='square'
              touchTarget={false}
              disabled={disabled || isLast}
              onClick={() => goTo(current + pageStep)}
            >
              <Icon
                name='chevron-right'
                size='sm'
                xstyle={rtl.mirror}
              />
            </Button>
            {hasFirstLast ? (
              <Button
                aria-label={lastPageLabel}
                color='neutral'
                variant='outline'
                size='sm'
                shape='square'
                touchTarget={false}
                disabled={disabled || isLast}
                onClick={() => goTo(pageCount)}
              >
                <Icon
                  name='chevron-double-right'
                  size='sm'
                  xstyle={rtl.mirror}
                />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
});
