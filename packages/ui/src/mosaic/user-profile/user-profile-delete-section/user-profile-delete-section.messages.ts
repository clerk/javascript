/**
 * Every string the surface renders. Shaped the way `@clerk/i18n` takes a base definition, so
 * localizing this component is a matter of registering the namespace and swapping the reads for
 * `useMessages('userButton', userButtonBase)`, not of hunting the literals down first.
 *
 * A plural message is its forms, the way `count()` takes them; a parameterized one is its template,
 * the way `params()` takes it. `plural` and `fill` below resolve them until that layer lands.
 */
export const userProfileDeleteSectionBase = {
  sectionTitle: 'Danger zone',
  sectionLabel: 'Delete account',
  sectionDescription: 'Permanently delete this account and all its data. This cannot be undone.',
  dialogTitle: 'Delete account?',
  dialogDescription: 'Are you sure you want to delete your account? All of your data will be permanently deleted.',
  fieldLabel: 'Type “{phrase}” below to continue',
  fieldPlaceholder: 'Delete account',
  actionLabel: 'Delete account',
  cancelLabel: 'Cancel',
};

/** Substitutes `{name}`-style placeholders. Replaced by the localization layer's own formatter. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}

/**
 * Picks a plural form and fills `{count}`. English has the two forms below; the localization layer
 * selects across all six categories with `Intl.PluralRules`.
 */
export function plural(forms: { one: string; other: string }, count: number): string {
  return fill(count === 1 ? forms.one : forms.other, { count });
}
