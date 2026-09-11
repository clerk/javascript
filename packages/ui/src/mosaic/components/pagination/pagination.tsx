import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { Button } from '../button';
import { ButtonContext } from '../button/button.context';
import { Icon } from '../icon';
import { Text } from '../text';
import { getPageItems } from './page-items';
import { ellipsisSizes, styles } from './pagination.styles';

export interface PaginationProps extends Omit<MosaicElementProps<'nav'>, 'onChange'> {
  page: number;
  totalItems: number;
  pageSize: number;
  onChange?: (page: number) => void;
  hasFirstLast?: boolean;
  step?: number;
  siblingCount?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  label?: string;
}

const controlSizes = {
  sm: { button: 'xs', icon: 'sm', text: 'xs' },
  md: { button: 'sm', icon: 'sm', text: 'sm' },
  lg: { button: 'md', icon: 'md', text: 'sm' },
} as const;

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
    hasFirstLast = false,
    step = 1,
    siblingCount = 1,
    size = 'md',
    disabled = false,
    label = 'Pagination',
    className,
    style,
    ...rest
  },
  ref,
) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const current = Math.min(Math.max(page, 1), pageCount);
  const isFirst = current <= 1;
  const isLast = current >= pageCount;
  const control = controlSizes[size];

  const pageDefaults = React.useMemo(
    () =>
      ({
        color: 'neutral',
        variant: 'ghost',
        size: control.button,
        disabled,
        styles: styles.page,
      }) as const,
    [control.button, disabled],
  );

  const goTo = (next: number) => onChange?.(Math.min(Math.max(next, 1), pageCount));

  return (
    <nav
      ref={ref}
      aria-label={label}
      {...mergeStyleProps(
        themeProps('pagination', { size, disabled }),
        stylex.props(reset.base, styles.root),
        className,
        style,
      )}
      {...rest}
    >
      <div {...mergeStyleProps(themeProps('pagination-controls'), stylex.props(reset.base, styles.controls))}>
        {hasFirstLast && (
          <Button
            aria-label='First page'
            color='neutral'
            variant='outline'
            size={control.button}
            shape='square'
            touchTarget={false}
            disabled={disabled || isFirst}
            onClick={() => goTo(1)}
          >
            <Icon
              name='chevron-double-left'
              size={control.icon}
            />
          </Button>
        )}
        <Button
          aria-label='Previous page'
          color='neutral'
          variant='outline'
          size={control.button}
          shape='square'
          touchTarget={false}
          disabled={disabled || isFirst}
          onClick={() => goTo(current - step)}
        >
          <Icon
            name='chevron-left'
            size={control.icon}
          />
        </Button>
        <ButtonContext.Provider value={pageDefaults}>
          {getPageItems(current, pageCount, siblingCount).map(item =>
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
                {...mergeStyleProps(
                  themeProps('pagination-ellipsis'),
                  stylex.props(reset.base, styles.ellipsis, ellipsisSizes[size]),
                )}
              >
                <Icon
                  name='ellipsis'
                  size={control.icon}
                />
              </span>
            ),
          )}
        </ButtonContext.Provider>
        <Button
          aria-label='Next page'
          color='neutral'
          variant='outline'
          size={control.button}
          shape='square'
          touchTarget={false}
          disabled={disabled || isLast}
          onClick={() => goTo(current + step)}
        >
          <Icon
            name='chevron-right'
            size={control.icon}
          />
        </Button>
        {hasFirstLast && (
          <Button
            aria-label='Last page'
            color='neutral'
            variant='outline'
            size={control.button}
            shape='square'
            touchTarget={false}
            disabled={disabled || isLast}
            onClick={() => goTo(pageCount)}
          >
            <Icon
              name='chevron-double-right'
              size={control.icon}
            />
          </Button>
        )}
      </div>
      <div {...mergeStyleProps(themeProps('pagination-page-size'), stylex.props(reset.base, styles.pageSize))}>
        <Text
          render={<span />}
          size={control.text}
          color='neutral'
        >
          Results per page
        </Text>
        <Button
          color='neutral'
          variant='outline'
          size={control.button}
          disabled={disabled}
        >
          {pageSize}
          <Icon
            name='chevron-down'
            placement='inline-end'
            size={control.icon}
          />
        </Button>
      </div>
    </nav>
  );
});
