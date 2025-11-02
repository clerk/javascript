function listFormatSupportedLocalesOf(locale?: string | string[]) {
  if (!locale) {
    return false;
  }
  const locales = Array.isArray(locale) ? locale : [locale];
  return (Intl as any).ListFormat.supportedLocalesOf(locales).length === locales.length;
}

/**
 * Intl.ListFormat was introduced in 2021
 * It is recommended to first check for browser support before using it
 */
export function canUseListFormat(locale: string | undefined) {
  return 'ListFormat' in Intl && listFormatSupportedLocalesOf(locale);
}

function numberFormatSupportedLocalesOf(locale?: string) {
  if (!locale) {
    return false;
  }

  try {
    return (Intl as any).NumberFormat.supportedLocalesOf(locale).length > 0;
  } catch {
    return false;
  }
}

export function canUseNumberFormat(locale: string | undefined) {
  return 'NumberFormat' in Intl && numberFormatSupportedLocalesOf(locale);
}

export function formatToCompactNumber(value: number, locale: string): string {
  if (!canUseNumberFormat(locale)) {
    return value.toString();
  }

  const formatter = new Intl.NumberFormat(locale, { notation: 'compact' });

  return formatter.format(value);
}
