const MILLISECONDS_IN_DAY = 86400000;
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function dateTo12HourTime(date: Date): string {
  if (!date) {
    return '';
  }
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: 'numeric',
    hour12: true,
  });
}

export function differenceInCalendarDays(a: Date, b: Date, { absolute = true } = {}): number {
  if (!a || !b) {
    return 0;
  }
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  const diff = Math.floor((utcB - utcA) / MILLISECONDS_IN_DAY);
  return absolute ? Math.abs(diff) : diff;
}

function normalizeDate(d: Date | string | number): Date {
  try {
    return new Date(d || new Date());
  } catch (e) {
    return new Date();
  }
}

/*
 * Follows date-fns format, see here:
 * https://date-fns.org/v2.21.1/docs/formatRelative
 * TODO: support localisation
 * | Distance to the base date | Result                    |
 * |---------------------------|---------------------------|
 * | Previous 6 days           | last Sunday at 04:30 AM   |
 * | Last day                  | yesterday at 04:30 AM     |
 * | Same day                  | today at 04:30 AM         |
 * | Next day                  | tomorrow at 04:30 AM      |
 * | Next 6 days               | Sunday at 04:30 AM        |
 * | Other                     | 12/31/2017                |
 */
export function formatRelative(date: Date, relativeTo: Date): string {
  if (!date || !relativeTo) {
    return '';
  }
  const a = normalizeDate(date);
  const b = normalizeDate(relativeTo);
  const differenceInDays = differenceInCalendarDays(b, a, { absolute: false });
  const time12Hour = dateTo12HourTime(a);
  const dayName = DAYS_EN[a.getDay()];

  if (differenceInDays < -6) {
    return a.toLocaleDateString();
  }
  if (differenceInDays < -1) {
    return `last ${dayName} at ${time12Hour}`;
  }
  if (differenceInDays === -1) {
    return `yesterday at ${time12Hour}`;
  }
  if (differenceInDays === 0) {
    return `today at ${time12Hour}`;
  }
  if (differenceInDays === 1) {
    return `tomorrow at ${time12Hour}`;
  }
  if (differenceInDays < 7) {
    return `${dayName} at ${time12Hour}`;
  }
  return a.toLocaleDateString();
}

export function addYears(initialDate: Date | number | string, yearsToAdd: number): Date {
  const date = normalizeDate(initialDate);
  date.setFullYear(date.getFullYear() + yearsToAdd);
  return date;
}
