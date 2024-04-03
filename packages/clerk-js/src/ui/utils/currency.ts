interface CurrencyFormatOptions {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  style: string;
}

export function formatCurrency(value: number, options?: CurrencyFormatOptions): string {
  const defaultOptions: CurrencyFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
    currency: 'USD',
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const formatter = new Intl.NumberFormat('en-US', mergedOptions);
  return formatter.format(value);
}

export function centsToUnit(cents: number) {
  const unitValue = cents / 100;
  return formatCurrency(unitValue);
}

export function unitToCents(unitValue: number) {
  return Math.round(unitValue * 100);
}
