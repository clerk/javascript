import * as Common from '@clerk/elements/common';
import React from 'react';

import { useAppearance } from '~/contexts';
import { useEnvironment } from '~/hooks/use-environment';
import { useLocalizations } from '~/hooks/use-localizations';
import * as Field from '~/primitives/field';

import { LinkRenderer } from './link-renderer';

export function LegalAcceptedField({
  className,
  checked = false,
  ...restProps
}: Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  const { t } = useLocalizations();
  const { displayConfig } = useEnvironment();
  const { parsedAppearance } = useAppearance();
  const termsUrl = parsedAppearance.options.termsPageUrl || displayConfig.termsUrl;
  const privacyPolicyUrl = parsedAppearance.options.privacyPageUrl || displayConfig.privacyPolicyUrl;

  let localizedText: string | undefined;

  if (termsUrl && privacyPolicyUrl) {
    localizedText = t('signUp.legalConsent.checkbox.label__termsOfServiceAndPrivacyPolicy', {
      termsOfServiceLink: termsUrl,
      privacyPolicyLink: privacyPolicyUrl,
    });
  } else if (termsUrl) {
    localizedText = t('signUp.legalConsent.checkbox.label__onlyTermsOfService', {
      termsOfServiceLink: termsUrl,
    });
  } else if (privacyPolicyUrl) {
    localizedText = t('signUp.legalConsent.checkbox.label__onlyPrivacyPolicy', {
      privacyPolicyLink: privacyPolicyUrl,
    });
  }

  return (
    <Common.Field
      name='legalAccepted'
      asChild
    >
      <Field.Root>
        <div className='flex justify-center gap-2'>
          <Common.Input
            type='checkbox'
            asChild
            checked={checked}
            {...restProps}
          >
            <Field.Checkbox />
          </Common.Input>

          <Common.Label asChild>
            <Field.Label>
              <span>
                <LinkRenderer
                  text={localizedText || ''}
                  className='underline underline-offset-2'
                />
              </span>
            </Field.Label>
          </Common.Label>
        </div>

        <Common.FieldError asChild>
          {({ message }) => {
            return <Field.Message intent='error'>{message}</Field.Message>;
          }}
        </Common.FieldError>
      </Field.Root>
    </Common.Field>
  );
}
