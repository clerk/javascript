interface CurrencyFormatOptions {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  style?: string;
}

export function formatCurrency({
  value,
  options,
  locale = 'en-US',
}: {
  value: number;
  options?: CurrencyFormatOptions;
  locale: string;
}): string {
  const defaultOptions: CurrencyFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
    currency: 'USD',
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const formatter = new Intl.NumberFormat(locale, mergedOptions);
  return formatter.format(value);
}

export function centsToUnit({ cents, locale }: { cents: number; locale: string }) {
  const unitValue = cents / 100;
  return formatCurrency({ value: unitValue, locale });
}

export function unitToCents({ unitValue }: { unitValue: number }) {
  return Math.round(unitValue * 100);
}
