import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { truncationStyles } from '../../utils/typography.styles';
import * as slots from './data-list.styles';

export type DataListProps = MosaicComponentProps<'dl'> & {
  /**
   * Rules between the items, for a list read row by row. Turn it off where the pairs are few
   * enough to scan as a block.
   *
   * @default true
   */
  divided?: boolean;
};

const DataListContext = React.createContext(true);

/**
 * Root list. Renders a `<dl>` and provides its `divided` to the items within it.
 *
 * @example
 * <DataList.Root>
 *   <DataList.Item>
 *     <DataList.Label>IP address</DataList.Label>
 *     <DataList.Value>2600:100e:b10b:787b</DataList.Value>
 *   </DataList.Item>
 * </DataList.Root>
 */
const Root = React.forwardRef<HTMLDListElement, DataListProps>(function MosaicDataList(
  { divided = true, render, xstyle, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'dl',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('data-list', { divided }), stylex.props(reset.base, slots.list.base, xstyle), rest),
    },
  });

  return <DataListContext.Provider value={divided}>{element}</DataListContext.Provider>;
});

const Item = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicDataListItem(
  { render, xstyle, ...rest },
  ref,
) {
  const divided = React.useContext(DataListContext);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('data-list-item'),
        stylex.props(reset.base, slots.item.base, divided && slots.item.divided, xstyle),
        rest,
      ),
    },
  });
});

const Label = React.forwardRef<HTMLElement, MosaicComponentProps<'dt'>>(function MosaicDataListLabel(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'dt',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('data-list-label'), stylex.props(reset.base, slots.label.base, xstyle), rest),
    },
  });
});

const Value = React.forwardRef<HTMLElement, MosaicComponentProps<'dd'>>(function MosaicDataListValue(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'dd',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('data-list-value'),
        stylex.props(reset.base, slots.value.base, truncationStyles.singleLine, xstyle),
        rest,
      ),
    },
  });
});

/**
 * Mosaic `DataList` — label/value pairs for read-only detail, such as the fields describing a
 * device or a payment method. Composed via dot syntax: `DataList.Root`, `DataList.Item`,
 * `DataList.Label`, `DataList.Value`. Every part takes a `render` prop and forwards a ref.
 *
 * Semantics come free: the parts render `dl`/`dt`/`dd`, so assistive technology reads each value
 * with the label it belongs to.
 */
export const DataList = { Root, Item, Label, Value };
