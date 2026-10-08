import { useUser } from '@clerk/shared/react';

const getEmailDomain = (email: string): string | null => email.split('@')[1]?.trim().toLowerCase() || null;

export const useDomainSuggestionModel = () => {
  const { user } = useUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  return { domain: primaryEmail ? getEmailDomain(primaryEmail) : null };
};
