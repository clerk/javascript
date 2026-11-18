import type { Faker } from '@faker-js/faker';
import { fakerAR, fakerDE, fakerFI, fakerFR, fakerJA, fakerPT_BR, fakerVI, fakerZH_CN } from '@faker-js/faker';

const LOCALES = [fakerDE, fakerAR, fakerFI, fakerJA, fakerPT_BR, fakerVI, fakerFR, fakerZH_CN];

const SAMPLES = 20;

const ROLES = [
  {
    label: 'Billing administrator',
    description: 'Can manage the subscription, payment methods and invoices, and export billing history.',
  },
  {
    label: 'Customer success lead (EMEA)',
    description: 'Can view every member and organization setting, and invite people to regional workspaces.',
  },
  {
    label: 'Read-only auditor',
    description: 'Can view members, roles, API keys and audit logs, but cannot change anything.',
  },
];

export function chaosName(index: number) {
  return longest(index, f => f.person.fullName());
}

export function chaosPerson(index: number) {
  return {
    firstName: longest(index, f => f.person.firstName()),
    lastName: longest(index, f => f.person.lastName()),
  };
}

export function chaosUsername(index: number) {
  return longest(index, f => f.internet.username());
}

export function chaosEmail(index: number) {
  return longest(index, f =>
    f.internet.email({
      firstName: f.person.firstName(),
      lastName: f.person.lastName(),
      provider: f.internet.domainName(),
    }),
  );
}

export function chaosCompany(index: number) {
  return longest(index, f => f.company.name());
}

export function chaosPhone(index: number) {
  return longest(index, f => f.phone.number({ style: 'international' }));
}

export function chaosSlug(index: number) {
  return `${chaosPick(LOCALES, index).helpers.slugify(chaosCompany(index)).toLowerCase()}-177654156132154`;
}

export function chaosPlace(index: number) {
  return longest(index, f => `${f.location.city()}, ${f.location.state()}, ${f.location.country()}`);
}

export function chaosRole(index: number) {
  return chaosPick(ROLES, index);
}

export function chaosPick<T>(values: readonly T[], index: number) {
  return values[index % values.length];
}

export function chaosRows<T extends { id: string }>(items: readonly T[], count = 60) {
  if (items.length === 0) {
    return [];
  }
  return Array.from({ length: Math.max(count, items.length) }, (_, index) => {
    const item = items[index % items.length];
    return index < items.length ? item : { ...item, id: `${item.id}-chaos-${index}` };
  });
}

function longest(index: number, make: (faker: Faker) => string) {
  const faker = chaosPick(LOCALES, index);
  faker.seed(index);
  return Array.from({ length: SAMPLES }, () => make(faker)).reduce((a, b) => (b.length > a.length ? b : a));
}
