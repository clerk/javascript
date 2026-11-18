'use client';

/**
 * Mosaic `DataList` — label/value pairs for read-only detail, such as the fields describing a
 * device or a payment method. Composed via dot syntax: `DataList.Root`, `DataList.Item`,
 * `DataList.Label`, `DataList.Value`. Every part takes a `render` prop and forwards a ref.
 *
 * Semantics come free: the parts render `dl`/`dt`/`dd`, so assistive technology reads each value
 * with the label it belongs to.
 */
export * as DataList from './data-list.parts';
export type { DataListProps } from './data-list';
