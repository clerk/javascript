import { titleize } from '@clerk/shared/underscore';

// TODO: ideally the derivation of these values lives in FAPI and comes back directly from the API

export function formatName(...args: (string | undefined)[]): string | undefined {
  switch (args.length) {
    case 0:
      return undefined;
    case 1:
      return titleize(args[0]);
    default:
      return args.filter(Boolean).map(titleize).join(' ');
  }
}

export function formatSalutation({
  firstName,
  lastName,
  identifier,
}: {
  firstName: string | undefined;
  lastName: string | undefined;
  identifier: string | undefined | null;
}): string {
  return (firstName && formatName(firstName)) || (lastName && formatName(lastName)) || identifier || '';
}
