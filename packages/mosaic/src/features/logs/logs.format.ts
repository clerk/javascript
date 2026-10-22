export function countryFlag(countryCode: string | undefined): string {
  if (!countryCode || !/^[a-z]{2}$/i.test(countryCode)) {
    return '🌐';
  }
  return String.fromCodePoint(...[...countryCode.toUpperCase()].map(char => 0x1f1e6 + char.charCodeAt(0) - 65));
}

export function formatLocation(location: { city?: string; country?: string } | undefined): string | undefined {
  if (!location) {
    return undefined;
  }
  return [location.city, location.country].filter(Boolean).join(', ') || undefined;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');
}
