'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { truncationStyles } from '../../styles/typography.styles';
import * as slots from './data-list.styles';

export type DataListRootProps = MosaicComponentProps<'dl'> & {
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
const Root = React.forwardRef<HTMLDListElement, DataListRootProps>(function MosaicDataList(
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

export type DataListItemProps = MosaicComponentProps<'div'>;

const Item = React.forwardRef<HTMLDivElement, DataListItemProps>(function MosaicDataListItem(
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

export type DataListLabelProps = MosaicComponentProps<'dt'>;

const Label = React.forwardRef<HTMLElement, DataListLabelProps>(function MosaicDataListLabel(
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

export type DataListValueProps = MosaicComponentProps<'dd'>;

const Value = React.forwardRef<HTMLElement, DataListValueProps>(function MosaicDataListValue(
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

declare namespace Root {
  type Props = DataListRootProps;
}

declare namespace Item {
  type Props = DataListItemProps;
}

declare namespace Label {
  type Props = DataListLabelProps;
}

declare namespace Value {
  type Props = DataListValueProps;
}

export { Root as DataListRoot, Item as DataListItem, Label as DataListLabel, Value as DataListValue };
