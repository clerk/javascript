const isEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

interface InviteMembersValidity {
  emailAddresses: string[];
  emailDraft: string;
  rejectedEmailAddresses: string[];
  role: string | null;
}

export function isValidEmail(value: string, rejectedEmailAddresses: string[]) {
  return isEmail(value) && !rejectedEmailAddresses.includes(value);
}

export function hasInvalidEmailAddresses(emailAddresses: string[], rejectedEmailAddresses: string[]) {
  return !emailAddresses.every(value => isValidEmail(value, rejectedEmailAddresses));
}

export function pendingEmailAddresses({
  emailAddresses,
  emailDraft,
}: Pick<InviteMembersValidity, 'emailAddresses' | 'emailDraft'>) {
  const draft = emailDraft.trim();
  return draft && !emailAddresses.includes(draft) ? [...emailAddresses, draft] : emailAddresses;
}

export function canSendInvitations({ rejectedEmailAddresses, role, ...input }: InviteMembersValidity) {
  const pending = pendingEmailAddresses(input);
  return pending.length > 0 && !hasInvalidEmailAddresses(pending, rejectedEmailAddresses) && role !== null;
}
