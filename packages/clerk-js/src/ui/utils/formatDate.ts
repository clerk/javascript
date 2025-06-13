export function formatDate(
  date: Date,
  format: 'monthyear' | 'short' | 'long' = 'long',
  locale: string = 'en-US',
): string {
  const options: Intl.DateTimeFormatOptions = {
    month: format === 'short' ? 'short' : 'long',
    ...(format !== 'monthyear' && { day: 'numeric' }),
    ...(format !== 'short' && { year: 'numeric' }),
  };

  return new Intl.DateTimeFormat(locale, options).format(date);
}
