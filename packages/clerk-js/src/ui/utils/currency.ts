interface CurrencyFormatOptions {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  style?: string;
  locale: string;
}

export function formatCurrency({ value, options }: { value: number; options?: CurrencyFormatOptions }): string {
  const defaultOptions: CurrencyFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
    currency: 'USD',
    locale: 'en-US',
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const formatter = new Intl.NumberFormat('en-US', mergedOptions);
  return formatter.format(value);
}

export function centsToUnit({ cents, locale }: { cents: number; locale: string }) {
  const unitValue = cents / 100;
  return formatCurrency({ value: unitValue, options: { locale } });
}

export function unitToCents({ unitValue }: { unitValue: number }) {
  return Math.round(unitValue * 100);
}
