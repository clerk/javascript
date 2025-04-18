import { normalizeDate } from '@clerk/shared/date';
import { titleize } from '@clerk/shared/underscore';

const timeString = (val: Date | string | number, locale?: string) => {
  try {
    return new Intl.DateTimeFormat(locale || 'en-US', { timeStyle: 'short' }).format(normalizeDate(val));
  } catch (e) {
    console.warn(e);
    return '';
  }
};

const weekday = (val: Date | string | number, locale?: string, weekday?: 'long' | 'short' | 'narrow' | undefined) => {
  try {
    return new Intl.DateTimeFormat(locale || 'en-US', { weekday: weekday || 'long' }).format(normalizeDate(val));
  } catch (e) {
    console.warn(e);
    return '';
  }
};

const shortDate = (val: Date | string | number, locale?: string) => {
  try {
    return new Intl.DateTimeFormat(locale || 'en-US', {
      month: 'short',
      day: 'numeric',
    }).format(normalizeDate(val));
  } catch (e) {
    console.warn(e);
    return '';
  }
};

const numeric = (val: Date | number | string, locale?: string) => {
  try {
    return new Intl.DateTimeFormat(locale || 'en-US').format(normalizeDate(val));
  } catch (e) {
    console.warn(e);
    return '';
  }
};

const link = (val: string, label?: string) => {
  return `[${label}](${val})`;
};

export const MODIFIERS = {
  titleize,
  timeString,
  weekday,
  numeric,
  link,
  shortDate,
} as const;
