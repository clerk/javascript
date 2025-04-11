export function formatDate(date: Date, format: 'short' | 'long' = 'long', locale: string = 'en-US'): string {
  const options: Intl.DateTimeFormatOptions = {
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
  };
  if (format === 'long') {
    options.year = 'numeric';
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
}
