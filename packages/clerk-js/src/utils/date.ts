function isValidDate(d: Date | unknown) {
  return d instanceof Date && !isNaN(d.getTime());
}

export function unixEpochToDate(epochInSeconds?: number): Date {
  const date = new Date(epochInSeconds || new Date());
  return isValidDate(date) ? date : new Date();
}

export function timeAgo(date: Date | string | number): string {
  const now = new Date();
  const then = new Date(date);

  if (isNaN(then.getTime())) return '';

  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(months / 12);
  return `${years}y ago`;
}
