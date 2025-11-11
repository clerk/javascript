import { localizationKeys } from '../localization';

export function timeAgo(date: Date | string | number) {
  const now = new Date();
  const then = new Date(date);

  if (isNaN(then.getTime())) {
    return '';
  }

  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (seconds < 60) {
    return localizationKeys('apiKeys.lastUsed__seconds', { seconds });
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return localizationKeys('apiKeys.lastUsed__minutes', { minutes });
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return localizationKeys('apiKeys.lastUsed__hours', { hours });
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return localizationKeys('apiKeys.lastUsed__days', { days });
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return localizationKeys('apiKeys.lastUsed__months', { months });
  }

  const years = Math.floor(months / 12);
  return localizationKeys('apiKeys.lastUsed__years', { years });
}
