/**
 * Every string the surface renders. Shaped the way `@clerk/i18n` takes a base definition, so
 * localizing this component is a matter of registering the namespace and swapping the reads for
 * `useMessages('userButton', userButtonBase)`, not of hunting the literals down first.
 *
 * A plural message is its forms, the way `count()` takes them; a parameterized one is its template,
 * the way `params()` takes it. `plural` and `fill` below resolve them until that layer lands.
 */
export const userButtonBase = {
  trigger: {
    open: 'Open account menu for {name}',
  },
  popup: {
    label: 'Account',
  },
  workspaces: {
    personal: 'Personal account',
    loading: 'Loading organizations…',
    members: { one: '{count} member', other: '{count} members' },
    accept: 'Accept',
    join: 'Join',
    requested: 'Requested',
    /** Names the pending indicator on a row and inside the accept and join buttons, read beside the label. */
    pending: 'pending',
  },
  accounts: {
    heading: 'Accounts',
    menu: 'Account actions',
    actionsFor: 'Actions for {identifier}',
    add: 'Add account',
    signOut: 'Sign out',
    signOutAll: 'Sign out of all accounts',
  },
  manage: {
    invite: 'Invite',
    account: 'Manage account',
    organization: 'Manage organization',
    createOrganization: 'Create organization',
  },
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
