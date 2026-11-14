export function useChaosFixture<T>(data: T, _toChaos: (data: T) => T): T {
  return data;
}

export function chaosName(_index: number) {
  return '';
}

export function chaosPerson(_index: number) {
  return { firstName: '', lastName: '' };
}

export function chaosUsername(_index: number) {
  return '';
}

export function chaosEmail(_index: number) {
  return '';
}

export function chaosCompany(_index: number) {
  return '';
}

export function chaosPhone(_index: number) {
  return '';
}

export function chaosSlug(_index: number) {
  return '';
}

export function chaosPlace(_index: number) {
  return '';
}

export function chaosRole(_index: number) {
  return { label: '', description: '' };
}

export function chaosPick<T>(values: readonly T[], index: number) {
  return values[index % values.length];
}

export function chaosRows<T extends { id: string }>(items: readonly T[], _count = 60): T[] {
  return [...items];
}
