import { useEffect, useMemo, useRef } from 'react';

import type { MosaicLocation, SegmentParts } from './location';
import { useRoutingConfig } from './router-adapter';
import { urlOf } from './url-location';
import { paramKey, readParam, splitParamValue, writeParam } from './url-params';
import type { MosaicLocationOptions } from './use-mosaic-location';
import { useAdapterRead } from './use-mosaic-location';
import { readWindowUrl, useWindowUrl, writeWindowUrl } from './window-location';

function holds(routing: MosaicLocationOptions['routing'], entry: SegmentParts | undefined): boolean {
  return routing === 'path' ? entry !== undefined && entry.length > 0 : entry !== undefined;
}

export function useConsumeLink(
  location: MosaicLocation,
  entry: SegmentParts | undefined,
  { routing, path = '/' }: MosaicLocationOptions,
): SegmentParts | undefined {
  const { queryPrefix, reads } = useRoutingConfig();
  const consumes = routing !== 'query';
  const fromAdapter = useAdapterRead(consumes ? reads.useSearchParams : undefined, '?');
  const fromWindow = useWindowUrl(consumes)?.search;
  const search = fromAdapter ?? fromWindow;
  const key = paramKey(queryPrefix, path);
  const held = holds(routing, entry);
  const linked = consumes && key !== '' && search !== undefined ? readParam(search, key) : undefined;
  const fromLink = useMemo(() => (linked === undefined ? undefined : splitParamValue(linked)), [linked]);
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
      const value = readParam(readWindowUrl().search, key);
      if (value === undefined) {
        return;
      }
      if (!atMount || !held) {
        location.write(splitParamValue(value), { replace: true });
      }
      const page = readWindowUrl();
      writeWindowUrl(urlOf({ ...page, search: writeParam(page.search, key, undefined) }), true);
    });
    return () => {
      live = false;
    };
  }, [search, consumes, key, held, location]);

  return held ? entry : (fromLink ?? entry);
}
