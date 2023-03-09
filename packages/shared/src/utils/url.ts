export function parseSearchParams(queryString = ''): URLSearchParams {
  if (queryString.startsWith('?')) {
    queryString = queryString.slice(1);
  }
  return new URLSearchParams(queryString);
}

export function stripScheme(url = ''): string {
  return (url || '').replace(/^.+:\/\//, '');
}

export function addClerkPrefix(str: string | undefined) {
  if (!str) {
    return '';
  }
  let regex;
  if (str.match(/(clerk\.)+(dev|com)$/)) {
    regex = /(clerk\.)*(?=clerk\.)/;
  } else {
    regex = /clerk\./gi;
  }

  const stripped = str.replace(regex, '');
  return `clerk.${stripped}`;
}
