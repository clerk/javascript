import { titleize } from '@clerk/shared';

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
  identifier: string | undefined;
}): string {
  return (firstName && formatName(firstName)) || (lastName && formatName(lastName)) || identifier || '';
}
