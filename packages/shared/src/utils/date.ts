const MILLISECONDS_IN_DAY = 86400000;

export function getNumericDateString(val: Date | number | string): string {
  try {
    const date = new Date(val);
    return new Intl.DateTimeFormat('en-US').format(date);
  } catch (e) {
    console.warn(e);
    return '';
  }
}

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

export type DateFormatRelativeParams = {
  date: Date | string | number;
  relativeTo: Date | string | number;
};

export type RelativeDateCase = 'numeric' | 'previous6DaysAt' | 'lastDayAt' | 'sameDayAt' | 'nextDayAt' | 'next6DaysAt';

/*
 * Follows date-fns format, see here:
 * https://date-fns.org/v2.21.1/docs/formatRelative
 * | Distance to the base date | Result                    |
 * |---------------------------|---------------------------|
 * | Previous 6 days           | last Sunday at 04:30 AM   |
 * | Last day                  | yesterday at 04:30 AM     |
 * | Same day                  | today at 04:30 AM         |
 * | Next day                  | tomorrow at 04:30 AM      |
 * | Next 6 days               | Sunday at 04:30 AM        |
 * | Other                     | 12/31/2017                |
 */
export function formatRelative({
  date,
  relativeTo,
}: DateFormatRelativeParams): { relativeDateCase: RelativeDateCase; date: Date } | null {
  if (!date || !relativeTo) {
    return null;
  }
  const a = normalizeDate(date);
  const b = normalizeDate(relativeTo);
  const differenceInDays = differenceInCalendarDays(b, a, { absolute: false });

  if (differenceInDays < -6) {
    return { relativeDateCase: 'numeric', date: a };
  }
  if (differenceInDays < -1) {
    return { relativeDateCase: 'previous6DaysAt', date: a };
  }
  if (differenceInDays === -1) {
    return { relativeDateCase: 'lastDayAt', date: a };
  }
  if (differenceInDays === 0) {
    return { relativeDateCase: 'sameDayAt', date: a };
  }
  if (differenceInDays === 1) {
    return { relativeDateCase: 'nextDayAt', date: a };
  }
  if (differenceInDays < 7) {
    return { relativeDateCase: 'next6DaysAt', date: a };
  }
  return { relativeDateCase: 'numeric', date: a };
}

export function addYears(initialDate: Date | number | string, yearsToAdd: number): Date {
  const date = normalizeDate(initialDate);
  date.setFullYear(date.getFullYear() + yearsToAdd);
  return date;
}
