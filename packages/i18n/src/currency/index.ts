import type { CurrencyFormatOptions } from '../formatter';
import type { CurrencyMarker } from '../types';

export type CurrencyFormatFn = (amount: number, currencyCode: string, opts?: CurrencyFormatOptions) => string;

export function createCurrencyFormatter(locale: string): CurrencyFormatFn {
  const nf: Record<string, Intl.NumberFormat> = {};

  return (amount, currencyCode, opts = {}) => {
    try {
      const currency = currencyCode !== '' ? currencyCode : 'USD';
      const baseKey = JSON.stringify({ style: 'currency', currency });
      nf[baseKey] ??= new Intl.NumberFormat(locale, { style: 'currency', currency });
      const { maximumFractionDigits } = nf[baseKey].resolvedOptions();
      const major = amount / 10 ** (maximumFractionDigits ?? 2);

      if (opts.style === 'short') {
        const shortKey = JSON.stringify({ style: 'currency', currency, trailingZeroDisplay: 'stripIfInteger' });
        nf[shortKey] ??= new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          trailingZeroDisplay: 'stripIfInteger',
        });
        return nf[shortKey].format(major);
      }

      return nf[baseKey].format(major);
    } catch {
      return `${currencyCode} ${(amount / 100).toFixed(2)}`;
    }
  };
}

export function currency(): CurrencyMarker {
  return { _type: 'currency' };
}
