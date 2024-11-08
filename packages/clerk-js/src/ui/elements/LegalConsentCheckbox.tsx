import { useEnvironment } from '../../ui/contexts';
import { sanitizeInputProps, useFormField } from '../../ui/primitives/hooks';
import type { LocalizationKey } from '../customizables';
import {
  descriptors,
  Flex,
  FormLabel,
  localizationKeys,
  Text,
  useAppearance,
  useLocalizations,
} from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { Field } from './FieldControl';
import { LinkRenderer } from './LinkRenderer';

const LegalCheckboxLabel = (props: { termsUrl?: string; privacyPolicyUrl?: string }) => {
  const { termsUrl, privacyPolicyUrl } = props;
  const { t } = useLocalizations();
  const formField = useFormField();
  const { placeholder, ...inputProps } = sanitizeInputProps(formField);
  let localizationKey: LocalizationKey | undefined;

  if (termsUrl && privacyPolicyUrl) {
    localizationKey = localizationKeys('signUp.legalConsent.checkbox.label__termsOfServiceAndPrivacyPolicy', {
      termsOfServiceLink: props.termsUrl,
      privacyPolicyLink: props.privacyPolicyUrl,
    });
  } else if (termsUrl) {
    localizationKey = localizationKeys('signUp.legalConsent.checkbox.label__onlyTermsOfService', {
      termsOfServiceLink: props.termsUrl,
    });
  } else if (privacyPolicyUrl) {
    localizationKey = localizationKeys('signUp.legalConsent.checkbox.label__onlyPrivacyPolicy', {
      privacyPolicyLink: props.privacyPolicyUrl,
    });
  }

  return (
    <FormLabel
      elementDescriptor={descriptors.formFieldCheckboxLabel}
      htmlFor={inputProps.id}
      isDisabled={inputProps.isDisabled}
      sx={t => ({
        paddingLeft: t.space.$1x5,
        textAlign: 'left',
      })}
    >
      <Text
        variant='body'
        as='span'
      >
        <LinkRenderer
          text={t(localizationKey)}
          isExternal
          sx={t => ({
            textDecoration: 'underline',
            textUnderlineOffset: t.space.$1,
          })}
        />
      </Text>
    </FormLabel>
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
      <Flex justify='center'>
        <Field.CheckboxIndicator
          elementDescriptor={descriptors.formFieldCheckboxInput}
          elementId={descriptors.formFieldInput.setId('legalAccepted')}
        />
        <LegalCheckboxLabel
          termsUrl={termsLink}
          privacyPolicyUrl={privacyPolicy}
        />
      </Flex>
    </Field.Root>
  );
};
