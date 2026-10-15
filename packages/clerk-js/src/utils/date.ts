function isValidDate(d: Date | unknown) {
  return d instanceof Date && !isNaN(d.getTime());
}

export function unixEpochToDate(epochInSeconds?: number): Date {
  const date = new Date(epochInSeconds || new Date());
  return isValidDate(date) ? date : new Date();
}

// Session deadlines use Unix epoch zero for "no deadline", so 0 must not fall back to the current time.
export function unixEpochToSessionDeadline(epochInMilliseconds?: number): Date {
  return epochInMilliseconds === 0 ? new Date(0) : unixEpochToDate(epochInMilliseconds);
}
