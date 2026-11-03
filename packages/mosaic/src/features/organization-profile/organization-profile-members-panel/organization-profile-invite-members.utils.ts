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

export function canSendInvitations({
  emailAddresses,
  emailDraft,
  rejectedEmailAddresses,
  role,
}: InviteMembersValidity) {
  const draft = emailDraft.trim();
  const pending = draft ? [...emailAddresses, draft] : emailAddresses;
  return pending.length > 0 && !hasInvalidEmailAddresses(pending, rejectedEmailAddresses) && role !== null;
}
