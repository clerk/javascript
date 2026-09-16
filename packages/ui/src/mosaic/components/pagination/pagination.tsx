import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { Button } from '../button';
import { ButtonContext } from '../button/button.context';
import { Icon } from '../icon';
import { Select } from '../select';
import { Text } from '../text';
import { getPageItems } from './page-items';
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
}

function atLeast(value: number, min: number): number {
  return Number.isFinite(value) && value > min ? Math.floor(value) : min;
}

const defaultPageSizeOptions = [10, 25, 50, 100];

/**
 * Page navigation for a paged list. Renders a labelled `nav` with previous/next controls, the
 * page numbers around the current one, and a results-per-page control. Pages are 1-based;
 * `onChange` receives the page the user asked for.
 *
 * @example
 * <Pagination page={page} totalItems={120} pageSize={10} onChange={setPage} />
 *
 * @example
 * // With jump-to-ends controls and a wider window of pages
 * <Pagination page={page} totalItems={120} pageSize={10} onChange={setPage} hasFirstLast siblingCount={2} />
 */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(function MosaicPagination(
  {
    page,
    totalItems,
    pageSize,
    onChange,
    pageSizeOptions = defaultPageSizeOptions,
    onPageSizeChange,
    hasFirstLast = false,
    step = 1,
    siblingCount = 1,
    disabled = false,
    label = 'Pagination',
    xstyle,
    ...rest
  },
  ref,
) {
  const itemsPerPage = atLeast(pageSize, 1);
  const pageStep = atLeast(step, 1);
  const siblings = atLeast(siblingCount, 0);
  const pageCount = Math.max(1, Math.ceil(atLeast(totalItems, 0) / itemsPerPage));
  const current = Math.min(atLeast(page, 1), pageCount);
  const labelId = React.useId();
  const pageSizeItems = React.useMemo(() => {
    const sizes = pageSizeOptions.includes(itemsPerPage) ? pageSizeOptions : [...pageSizeOptions, itemsPerPage];
    return sizes
      .slice()
      .sort((a, b) => a - b)
      .map(size => ({ value: String(size), label: String(size) }));
  }, [pageSizeOptions, itemsPerPage]);
  const isFirst = current <= 1;
  const isLast = current >= pageCount;

  const pageDefaults = React.useMemo(
    () =>
      ({
        color: 'neutral',
        variant: 'ghost',
        size: 'sm',
        disabled,
        styles: styles.page,
      }) as const,
    [disabled],
  );

  const goTo = (next: number) => onChange?.(Math.min(Math.max(next, 1), pageCount));

  return (
    <nav
      ref={ref}
      aria-label={label}
      {...mergeStyleProps(themeProps('pagination', { disabled }), stylex.props(reset.base, styles.root, xstyle), rest)}
    >
      <div {...mergeStyleProps(themeProps('pagination-controls'), stylex.props(reset.base, styles.controls))}>
        {hasFirstLast && (
          <Button
            aria-label='First page'
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
            />
          </Button>
        )}
        <Button
          aria-label='Previous page'
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
          />
        </Button>
        <ButtonContext.Provider value={pageDefaults}>
          {getPageItems(current, pageCount, siblings).map(item =>
            typeof item === 'number' ? (
              <Button
                key={item}
                aria-current={item === current ? 'page' : undefined}
                touchTarget={false}
                onClick={() => goTo(item)}
              >
                {item}
              </Button>
            ) : (
              <span
                key={item}
                aria-hidden
                {...mergeStyleProps(themeProps('pagination-ellipsis'), stylex.props(reset.base, styles.ellipsis))}
              >
                <Icon
                  name='ellipsis'
                  size='sm'
                />
              </span>
            ),
          )}
        </ButtonContext.Provider>
        <Button
          aria-label='Next page'
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
          />
        </Button>
        {hasFirstLast && (
          <Button
            aria-label='Last page'
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
            />
          </Button>
        )}
      </div>
      <div {...mergeStyleProps(themeProps('pagination-page-size'), stylex.props(reset.base, styles.pageSize))}>
        <Text
          id={labelId}
          render={<span />}
          size='sm'
          color='neutral'
        >
          Results per page
        </Text>
        <Select.Root
          items={pageSizeItems}
          value={String(itemsPerPage)}
          onValueChange={value => onPageSizeChange?.(Number(value))}
        >
          <Select.Trigger
            aria-labelledby={labelId}
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
    </nav>
  );
});
