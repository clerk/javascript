const isEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

interface InviteMembersDraft {
  emailAddresses: string[];
  emailDraft: string;
}

interface InviteMembersValidity extends InviteMembersDraft {
  rejectedEmailAddresses: string[];
  role: string | null;
}

export function isValidEmail(value: string, rejectedEmailAddresses: string[]) {
  return isEmail(value) && !rejectedEmailAddresses.includes(value);
}

export function hasInvalidEmailAddresses(emailAddresses: string[], rejectedEmailAddresses: string[]) {
  return !emailAddresses.every(value => isValidEmail(value, rejectedEmailAddresses));
}

export function emailAddressesToInvite({ emailAddresses, emailDraft }: InviteMembersDraft) {
  const draft = emailDraft.trim();
  return draft && !emailAddresses.includes(draft) ? [...emailAddresses, draft] : emailAddresses;
}

export function canSendInvitations({ rejectedEmailAddresses, role, ...draft }: InviteMembersValidity) {
  const emailAddresses = emailAddressesToInvite(draft);
  return (
    emailAddresses.length > 0 && !hasInvalidEmailAddresses(emailAddresses, rejectedEmailAddresses) && role !== null
  );
}
