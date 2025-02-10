import { formatRelative } from '@clerk/shared/date';

import { localizationKeys } from '../localization';

export const getRelativeToNowDateKey = (date: Date) => {
  const relativeDate = formatRelative({ date: date || new Date(), relativeTo: new Date() });
  if (!relativeDate) {
    return '';
  }
  switch (relativeDate.relativeDateCase) {
    case 'previous6Days':
      return localizationKeys('dates.previous6Days', { date: relativeDate.date });
    case 'lastDay':
      return localizationKeys('dates.lastDay', { date: relativeDate.date });
    case 'sameDay':
      return localizationKeys('dates.sameDay', { date: relativeDate.date });
    case 'nextDay':
      return localizationKeys('dates.nextDay', { date: relativeDate.date });
    case 'next6Days':
      return localizationKeys('dates.next6Days', { date: relativeDate.date });
    case 'other':
    default:
      return localizationKeys('dates.numeric', { date: relativeDate.date });
  }
};
