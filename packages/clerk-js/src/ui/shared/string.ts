const IP_V4_ADDRESS_REGEX =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export function isIPV4Address(str: string | undefined | null): boolean {
  return IP_V4_ADDRESS_REGEX.test(str || '');
}

export function titleize(str: string | undefined | null): string {
  const s = str || '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function snakeToCamel(str: string | undefined): string {
  return str ? str.replace(/([-_][a-z])/g, match => match.toUpperCase().replace(/-|_/, '')) : '';
}

export function camelToSnake(str: string | undefined): string {
  return str ? str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`) : '';
}
