import type * as Common from '@clerk/elements/common';
import * as React from 'react';

import { EmailField } from './EmailField';
import { PhoneNumberField } from './PhoneNumberField';

export function EmailOrPhoneNumberField({
  className,
  labelEmail = 'Email address',
  labelPhoneNumber = 'Phone number',
  locationBasedCountryIso,
  ...props
}: {
  labelEmail?: React.ReactNode;
  labelPhoneNumber?: React.ReactNode;
  locationBasedCountryIso: React.ComponentProps<typeof PhoneNumberField>['locationBasedCountryIso'];
} & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const [showPhoneNumberField, setShowPhoneNumberField] = React.useState(false);

  return showPhoneNumberField ? (
    <PhoneNumberField
      label={labelPhoneNumber}
      locationBasedCountryIso={locationBasedCountryIso}
      alternativeFieldTrigger={
        <button
          type='button'
          className='-mx-0.5 px-0.5 text-accent-9 text-sm font-medium hover:underline rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-default'
          onClick={() => setShowPhoneNumberField(false)}
        >
          Use email instead
        </button>
      }
      {...props}
    />
  ) : (
    <EmailField
      {...props}
      label={labelEmail}
      alternativeFieldTrigger={
        <button
          type='button'
          className='-mx-0.5 px-0.5 text-accent-9 text-sm font-medium hover:underline rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-default'
          onClick={() => setShowPhoneNumberField(true)}
        >
          Use phone instead
        </button>
      }
    />
  );
}
