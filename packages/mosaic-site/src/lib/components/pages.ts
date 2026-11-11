const withoutPages =
  (hidden: string[]) =>
  <T extends object>(pages: T): T =>
    Object.fromEntries(Object.entries(pages).filter(([id]) => !hidden.includes(id))) as T;
export const withoutUserComingSoon = withoutPages(['billing']);
export const withoutOrganizationComingSoon = withoutPages(['security', 'billing']);
