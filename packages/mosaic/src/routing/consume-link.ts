import { useEffect, useMemo, useRef } from 'react';

import type { MosaicLocation, SegmentParts } from './location';
import { useRoutingConfig } from './router-adapter';
import { urlOf } from './url-location';
import { decodeParts, paramKey, readParam, writeParam } from './url-params';
import type { MosaicLocationOptions } from './use-mosaic-location';
import { useAdapterRead } from './use-mosaic-location';
import { readWindowUrl, useWindowUrl, writeWindowUrl } from './window-location';

function holds(routing: MosaicLocationOptions['routing'], segment: SegmentParts | undefined): boolean {
  return routing === 'path' ? segment !== undefined && segment.length > 0 : segment !== undefined;
}

export function useConsumeLink(
  location: MosaicLocation,
  segment: SegmentParts | undefined,
  { routing, path = '/' }: MosaicLocationOptions,
): SegmentParts | undefined {
  const { queryPrefix, reads } = useRoutingConfig();
  const consumes = routing !== 'query';
  const fromAdapter = useAdapterRead(consumes ? reads.useSearchParams : () => undefined, '?');
  const fromWindow = useWindowUrl(consumes)?.search;
  const search = fromAdapter ?? fromWindow;
  const key = paramKey(queryPrefix, path);
  const held = holds(routing, segment);
  const linked = consumes && key !== '' && search !== undefined ? readParam(search, key) : undefined;
  const fromLink = useMemo(() => (linked === undefined ? undefined : decodeParts(linked)), [linked]);
  const settled = useRef(false);

  useEffect(() => {
    if (!consumes || key === '') {
      return;
    }
    let live = true;
    queueMicrotask(() => {
      if (!live) {
        return;
      }
      const atMount = !settled.current;
      settled.current = true;
      const before = readWindowUrl();
      const value = before === undefined ? undefined : readParam(before.search, key);
      if (value === undefined) {
        return;
      }
      if (!atMount || !held) {
        location.write(decodeParts(value), { replace: true });
      }
      const page = readWindowUrl();
      if (page === undefined) {
        return;
      }
      writeWindowUrl(urlOf({ ...page, search: writeParam(page.search, key, undefined) }), true);
    });
    return () => {
      live = false;
    };
  }, [search, consumes, key, held, location]);

  return held ? segment : (fromLink ?? segment);
}
