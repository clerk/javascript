import { computed } from 'nanostores';

import type { ReadableStore } from '../types';

export interface Formatter {
  time(date: Date | number, opts?: Intl.DateTimeFormatOptions): string;
  number(value: number | bigint, opts?: Intl.NumberFormatOptions): string;
  relativeTime(value: number, unit: Intl.RelativeTimeFormatUnit, opts?: Intl.RelativeTimeFormatOptions): string;
}

/**
 * A reactive `Intl` formatter bound to a locale store. The underlying `Intl`
 * instances are cached per `options` key and rebuilt only when the locale
 * changes, so they are not reconstructed on every call.
 */
export function formatter($locale: ReadableStore<string>): ReadableStore<Formatter> {
  return computed($locale, (locale): Formatter => {
    const dtf: Record<string, Intl.DateTimeFormat> = {};
    const nf: Record<string, Intl.NumberFormat> = {};
    const rtf: Record<string, Intl.RelativeTimeFormat> = {};

    return {
      time(date, opts = {}) {
        const key = JSON.stringify(opts);
        dtf[key] ??= new Intl.DateTimeFormat(locale, opts);
        return dtf[key].format(typeof date === 'number' ? new Date(date) : date);
      },
      number(value, opts = {}) {
        const key = JSON.stringify(opts);
        nf[key] ??= new Intl.NumberFormat(locale, opts);
        return nf[key].format(value);
      },
      relativeTime(value, unit, opts = {}) {
        const key = JSON.stringify(opts);
        rtf[key] ??= new Intl.RelativeTimeFormat(locale, { numeric: 'auto', ...opts });
        return rtf[key].format(value, unit);
      },
    };
  });
}
