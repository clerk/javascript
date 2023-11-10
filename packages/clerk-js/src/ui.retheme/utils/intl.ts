function supportedLocalesOf(locale?: string | string[]) {
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
  return 'ListFormat' in Intl && supportedLocalesOf(locale);
}
