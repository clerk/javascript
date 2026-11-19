import type { ReactNode } from 'react';

import { Checkbox } from '../../../components/checkbox';
import { Field } from '../../../components/field';
import type { UseFormResult } from '../../../components/form';
import { Link } from '../../../components/link';
import { rich, useMessages } from '../../../localization';
import type { SignUpLegalConsent, SignUpValues } from '../sign-up.types';
import { legalConsentLabel } from '../sign-up.utils';

export function SignUpLegalConsentField({
  form,
  consent,
  disabled,
}: {
  form: UseFormResult<SignUpValues>;
  consent: SignUpLegalConsent;
  disabled: boolean;
}) {
  const m = useMessages('signUp');
  const { feedback } = form.fields.legalAccepted;
  const link = (href: string | undefined) => (children: ReactNode) =>
    href ? (
      <Link
        href={href}
        target='_blank'
        rel='noopener noreferrer'
      >
        {children}
      </Link>
    ) : (
      children
    );

  return (
    <Field.Root
      orientation='horizontal'
      required
      invalid={feedback?.type === 'error'}
      disabled={disabled}
    >
      <Checkbox
        checked={form.values.legalAccepted}
        onChange={event => form.setValue('legalAccepted', event.target.checked)}
      />
      <Field.Label>
        {rich(legalConsentLabel(consent, m), {
          components: { terms: link(consent.termsUrl), privacy: link(consent.privacyPolicyUrl) },
        })}
      </Field.Label>
    </Field.Root>
  );
}
