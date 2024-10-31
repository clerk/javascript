import { useEnvironment } from '../../ui/contexts';
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
  let localizationKey: LocalizationKey | undefined;

  if (termsUrl && privacyPolicyUrl) {
    localizationKey = localizationKeys(
      'signUp.__experimental_legalConsent.checkbox.label__termsOfServiceAndPrivacyPolicy',
      {
        termsOfServiceLink: props.termsUrl,
        privacyPolicyLink: props.privacyPolicyUrl,
      },
    );
  } else if (termsUrl) {
    localizationKey = localizationKeys('signUp.__experimental_legalConsent.checkbox.label__onlyTermsOfService', {
      termsOfServiceLink: props.termsUrl,
    });
  } else if (privacyPolicyUrl) {
    localizationKey = localizationKeys('signUp.__experimental_legalConsent.checkbox.label__onlyPrivacyPolicy', {
      privacyPolicyLink: props.privacyPolicyUrl,
    });
  }

  return (
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
        <FormLabel
          elementDescriptor={descriptors.formFieldCheckboxLabel}
          htmlFor={props.itemID}
          sx={t => ({
            paddingLeft: t.space.$1x5,
            textAlign: 'left',
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
