const MILLISECONDS_IN_DAY = 86400000;

/**
 *
 */
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

/**
 *
 */
export function differenceInCalendarDays(a: Date, b: Date, { absolute = true } = {}): number {
  if (!a || !b) {
    return 0;
  }
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  const diff = Math.floor((utcB - utcA) / MILLISECONDS_IN_DAY);
  return absolute ? Math.abs(diff) : diff;
}

/**
 *
 */
export function normalizeDate(d: Date | string | number): Date {
  try {
    return new Date(d || new Date());
  } catch {
    return new Date();
  }
}

type DateFormatRelativeParams = {
  date: Date | string | number;
  relativeTo: Date | string | number;
};

export type RelativeDateCase = 'previous6Days' | 'lastDay' | 'sameDay' | 'nextDay' | 'next6Days' | 'other';
type RelativeDateReturn = { relativeDateCase: RelativeDateCase; date: Date } | null;

/**
 *
 */
export function formatRelative(props: DateFormatRelativeParams): RelativeDateReturn {
  const { date, relativeTo } = props;
  if (!date || !relativeTo) {
    return null;
  }
  const a = normalizeDate(date);
  const b = normalizeDate(relativeTo);
  const differenceInDays = differenceInCalendarDays(b, a, { absolute: false });

  if (differenceInDays < -6) {
    return { relativeDateCase: 'other', date: a };
  }
  if (differenceInDays < -1) {
    return { relativeDateCase: 'previous6Days', date: a };
  }
  if (differenceInDays === -1) {
    return { relativeDateCase: 'lastDay', date: a };
  }
  if (differenceInDays === 0) {
    return { relativeDateCase: 'sameDay', date: a };
  }
  if (differenceInDays === 1) {
    return { relativeDateCase: 'nextDay', date: a };
  }
  if (differenceInDays < 7) {
    return { relativeDateCase: 'next6Days', date: a };
  }
  return { relativeDateCase: 'other', date: a };
}

/**
 *
 */
export function addYears(initialDate: Date | number | string, yearsToAdd: number): Date {
  const date = normalizeDate(initialDate);
  date.setFullYear(date.getFullYear() + yearsToAdd);
  return date;
}
