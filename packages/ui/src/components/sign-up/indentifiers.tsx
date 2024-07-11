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

  if (emailAddress) {
    return <span>{client.signUp.emailAddress}</span>;
  }

  if (phoneNumber) {
    const { formattedNumberWithCode } = parsePhoneString(client.signUp.phoneNumber || '');
    return <span>{formattedNumberWithCode}</span>;
  }

  return null;
}
