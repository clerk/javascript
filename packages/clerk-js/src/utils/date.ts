function isValidDate(d: Date | unknown) {
  return d instanceof Date && !isNaN(d.getTime());
}

export function unixEpochToDate(epochInSeconds?: number): Date {
  const date = new Date(epochInSeconds || new Date());
  return isValidDate(date) ? date : new Date();
}

export function unixEpochToDeadline(epoch?: number): Date {
  return epoch === 0 ? new Date(0) : unixEpochToDate(epoch);
}
