/**
 * Strings for the account section's dialogs. Shaped the way `@clerk/i18n` takes a base definition,
 * so localizing them is a matter of registering the namespace and swapping the reads for
 * `useMessages('userProfileAccountSection', userProfileAccountSectionBase)`.
 *
 * The section's own row copy is still inline in the view; it moves here when it is localized.
 */
export const userProfileAccountSectionBase = {
  editName: {
    trigger: 'Edit name',
    title: 'Edit name',
    firstNameLabel: 'First name',
    lastNameLabel: 'Last name',
    cancelLabel: 'Cancel',
    actionLabel: 'Save changes',
  },
};
