import React from 'react';

import { useLocale } from '../../../localization/context';
import type { ChartFormatPlace } from '../chart-series';

/** Axis and tooltip strings for one chart. */
export interface ChartFormat {
  value: (value: number, place: ChartFormatPlace) => string;
  category: (key: string, place: ChartFormatPlace) => string;
}

export interface ChartFormatOptions {
  formatValue?: (value: number, place: ChartFormatPlace) => string;
  formatCategory?: (key: string, place: ChartFormatPlace) => string;
}

/** A UTC date key, as `Chart.XAxis ticks='calendar'` requires: `2026-01-05` or a full ISO string in UTC. */
const UTC_DATE_KEY = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?Z)?$/;

/**
 * Defaults come from the Mosaic locale. Values use `Intl.NumberFormat`, compact on the axis. A key
 * that is a UTC date formats in UTC rather than local time, which would show the previous day west
 * of Greenwich. Any other key shows as is.
 */
export function useChartFormat({ formatValue, formatCategory }: ChartFormatOptions): ChartFormat {
  const locale = useLocale();
  const defaults = React.useMemo(() => {
    const number = new Intl.NumberFormat(locale);
    const compact = new Intl.NumberFormat(locale, { notation: 'compact' });
    const shortDate = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', month: 'short', day: 'numeric' });
    const longDate = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', dateStyle: 'medium' });
    return {
      value: (value: number, place: ChartFormatPlace) => (place === 'axis' ? compact : number).format(value),
      category: (key: string, place: ChartFormatPlace) => {
        const date = UTC_DATE_KEY.test(key) ? new Date(key) : null;
        if (!date || Number.isNaN(date.getTime())) {
          return key;
        }
        return (place === 'axis' ? shortDate : longDate).format(date);
      },
    };
  }, [locale]);
  return React.useMemo(
    () => ({ value: formatValue ?? defaults.value, category: formatCategory ?? defaults.category }),
    [defaults, formatCategory, formatValue],
  );
}
