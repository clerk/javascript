import { describe, expect, it } from 'vitest';

import type { RelativeDateCase } from '../date';
import { addYears, dateTo12HourTime, differenceInCalendarDays, formatRelative } from '../date';

describe('date utils', () => {
  describe('dateTo12HourTime(date)', () => {
    const cases: Array<[Date | undefined, string]> = [
      [undefined, ''],
      [new Date('1/1/2020 23:15'), '11:15 PM'],
      [new Date('1/1/2020 11:15'), '11:15 AM'],
      [new Date('1/1/2020 01:59'), '01:59 AM'],
      [new Date('1/1/2020 13:59'), '01:59 PM'],
      [new Date('1/1/2020 00:59'), '12:59 AM'],
    ];

    it.each(cases)('.dateTo12HourTime(%s) => %s', (a, expected) => {
      expect(dateTo12HourTime(a as any)).toBe(expected);
    });
  });

  describe('differenceInCalendarDays(date1, date2)', () => {
    const cases: Array<[Date | undefined, Date, { absolute: boolean }, number]> = [
      [undefined, new Date(), { absolute: true }, 0],
      [new Date('1/1/2020'), new Date('1/2/2020'), { absolute: true }, 1],
      [new Date('1/1/2020'), new Date('1/3/2020'), { absolute: true }, 2],
      [new Date('1/30/2020'), new Date('1/31/2020'), { absolute: true }, 1],
      [new Date('1/30/2020'), new Date('2/1/2020'), { absolute: true }, 2],
      [new Date('1/1/2020'), new Date('2/1/2020'), { absolute: true }, 31],
      [new Date('1/1/2020'), new Date('1/2/2020'), { absolute: false }, 1],
      [new Date('1/1/2020'), new Date('1/5/2020'), { absolute: false }, 4],
      [new Date('1/5/2020'), new Date('1/1/2020'), { absolute: true }, 4],
      [new Date('1/5/2020'), new Date('1/1/2020'), { absolute: false }, -4],
    ];

    it.each(cases)('.differenceInCalendarDays(%s,%s) => %s', (a, b, c, expected) => {
      expect(differenceInCalendarDays(a as Date, b, c)).toBe(expected);
    });
  });

  describe('formatRelative(date)', () => {
    const cases: Array<[Date | undefined, Date | undefined, RelativeDateCase | null]> = [
      [undefined, undefined, null],
      [new Date('1/1/2020 23:15'), new Date('1/1/2020'), 'sameDay'],
      [new Date('1/5/2020 23:15'), new Date('1/6/2020'), 'lastDay'],
      [new Date('1/3/2020 23:15'), new Date('1/6/2020'), 'previous6Days'],
      [new Date('1/7/2020 23:15'), new Date('1/6/2020'), 'nextDay'],
      [new Date('1/10/2020 23:15'), new Date('1/6/2020'), 'next6Days'],
      [new Date('12/10/2020 23:15'), new Date('1/6/2020'), 'other'],
      [new Date('12/10/2020 23:15'), new Date('1/6/2021'), 'other'],
    ];

    it.each(cases)('.formatRelative(%s, %s) => %s', (a, b, expected) => {
      expect(formatRelative({ date: a as Date, relativeTo: b as Date })?.relativeDateCase || null).toBe(expected);
    });
  });

  describe('addYears(date, number)', () => {
    const cases: Array<[Date, number, Date]> = [
      [new Date('1/1/2020 23:15'), 1, new Date('1/1/2021 23:15')],
      [new Date('1/1/2019 23:15'), 1, new Date('1/1/2020 23:15')],
      [new Date('1/1/2021 23:15'), 100, new Date('1/1/2121 23:15')],
      [new Date('1/1/2021 23:15'), 0, new Date('1/1/2021 23:15')],
    ];

    it.each(cases)('.addYears(%s, %s) => %s', (a, b, expected) => {
      expect(addYears(a, b)).toStrictEqual(expected);
    });
  });
});
