import { titleize } from '@clerk/shared';

const timeString = (val: Date | string | number, locale?: string): string => {
  try {
    return new Date(val).toLocaleString(locale || 'en-US', {
      hour: '2-digit',
      minute: 'numeric',
      hour12: true,
    });
  } catch (e) {
    console.warn(e);
    return '';
  }
};
const weekday = (val: Date | string | number, locale?: string, weekday?: 'long' | 'short' | 'narrow' | undefined) => {
  try {
    return new Intl.DateTimeFormat(locale || 'en-US', { weekday: weekday || 'long' }).format(new Date(val));
  } catch (e) {
    console.warn(e);
    return '';
  }
};
export const MODIFIERS = {
  titleize,
  timeString,
  weekday,
} as const;
