import { useClerk } from '@clerk/clerk-react';

import { parsePhoneString } from '~/common/phone-number-field/utils';
import type { RequireExactlyOne } from '~/types/utils';

type Identifiers = {
  emailAddress: boolean;
  phoneNumber: boolean;
};

type Identifier = RequireExactlyOne<Identifiers>;

export function SignUpIdentifier({ emailAddress, phoneNumber }: Identifier) {
  const { client } = useClerk();
  const signUpEmailAddress = client.signUp.emailAddress;
  const { formattedNumberWithCode: signUpPhoneNumber } = parsePhoneString(client.signUp.phoneNumber || '');

  if (emailAddress) {
    return <span>{signUpEmailAddress}</span>;
  }

  if (phoneNumber) {
    return <span>{signUpPhoneNumber}</span>;
  }

  return null;
}
