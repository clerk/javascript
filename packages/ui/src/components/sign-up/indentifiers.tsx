import { useClerk } from '@clerk/clerk-react';

import { parsePhoneString } from '~/common/phone-number-field/utils';

type Identifier =
  | {
      emailAddress: boolean;
      phoneNumber?: never;
    }
  | {
      emailAddress?: never;
      phoneNumber: boolean;
    };

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
