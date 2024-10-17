import React from 'react';

import { useEnvironment } from '../../ui/contexts';
import type { LocalizationKey } from '../customizables';
import {
  descriptors,
  Flex,
  FormLabel,
  Link,
  localizationKeys,
  Text,
  useAppearance,
  useLocalizations,
} from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { Field } from './FieldControl';

const LegalCheckboxLabel = (props: { termsUrl?: string; privacyPolicyUrl?: string }) => {
  const { t } = useLocalizations();
  return (
    <Text
      variant='body'
      as='span'
    >
      {t(localizationKeys('signUp.legalConsent.checkbox.label__prefixText'))}
      {props.termsUrl && (
        <>
          {' '}
          <Link
            localizationKey={localizationKeys('signUp.legalConsent.checkbox.label__termsOfServiceText')}
            href={props.termsUrl}
            sx={{
              textDecoration: 'underline',
            }}
            isExternal
          />
        </>
      )}

      {props.termsUrl && props.privacyPolicyUrl && (
        <> {t(localizationKeys('signUp.legalConsent.checkbox.label__conjunctionText'))} </>
      )}

      {props.privacyPolicyUrl && (
        <>
          {' '}
          <Link
            localizationKey={localizationKeys('signUp.legalConsent.checkbox.label__privacyPolicyText')}
            href={props.termsUrl}
            sx={{
              textDecoration: 'underline',
              display: 'inline-block',
            }}
            isExternal
          />
        </>
      )}
    </Text>
  );
};

type CommonFieldRootProps = Omit<PropsOfComponent<typeof Field.Root>, 'children' | 'elementDescriptor' | 'elementId'>;

export const LegalCheckbox = (
  props: CommonFieldRootProps & {
    description?: string | LocalizationKey;
  },
) => {
  const { displayConfig } = useEnvironment();
  const { parsedLayout } = useAppearance();

  const termsLink = parsedLayout.termsPageUrl || displayConfig.termsUrl;
  const privacyPolicy = parsedLayout.privacyPageUrl || displayConfig.privacyPolicyUrl;

  return (
    <Field.Root {...props}>
      <Flex
        align='center'
        justify='center'
      >
        <Field.CheckboxIndicator />
        <FormLabel
          elementDescriptor={descriptors.formFieldRadioLabel}
          htmlFor={props.itemID}
          sx={t => ({
            paddingLeft: t.space.$1x5,
          })}
        >
          <LegalCheckboxLabel
            termsUrl={termsLink}
            privacyPolicyUrl={privacyPolicy}
          />
        </FormLabel>
      </Flex>
    </Field.Root>
  );
};
