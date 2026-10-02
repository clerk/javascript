import type { APIKeyExpiration } from './create-api-key.dialog';

const DAY_SECONDS = 24 * 60 * 60;

const expirationDays: Record<Exclude<APIKeyExpiration, 'never' | '1y'>, number> = {
  '1d': 1,
  '7d': 7,
  '30d': 30,
  '60d': 60,
  '90d': 90,
  '180d': 180,
};

const relativeUnits = [
  ['year', 365 * DAY_SECONDS],
  ['month', 30 * DAY_SECONDS],
  ['week', 7 * DAY_SECONDS],
  ['day', DAY_SECONDS],
  ['hour', 60 * 60],
  ['minute', 60],
] as const;

export function getExpirationDate(expiration: APIKeyExpiration, now: Date): Date | null {
  if (expiration === 'never') {
    return null;
  }
  const date = new Date(now);
  if (expiration === '1y') {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setDate(date.getDate() + expirationDays[expiration]);
  }
  return date;
}

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function formatRelativeTime(date: Date, locale: string, now: Date): string {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const unit = relativeUnits.find(([, size]) => Math.abs(seconds) >= size);
  return unit ? format.format(Math.round(seconds / unit[1]), unit[0]) : format.format(seconds, 'second');
}
