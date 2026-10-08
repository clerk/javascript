import { localizationKeys } from '@/customizables';

import type { LocalizationKey } from '../../../localization';

const DOCS_BASE_URL = 'https://clerk.com/docs/guides/organizations/add-members/sso';

export type HowToFixContent =
  | { kind: 'description'; descriptionKey: LocalizationKey }
  | { kind: 'steps'; introKey?: LocalizationKey; stepKeys: LocalizationKey[] };

const HOW_TO_FIX_BY_ERROR_CODE: Record<string, HowToFixContent> = {
  saml_user_attribute_missing: {
    kind: 'steps',
    introKey: localizationKeys(
      'configureSSO.testConfigurationStep.testRunDetails.howToFix.saml_user_attribute_missing.intro',
    ),
    stepKeys: [
      localizationKeys('configureSSO.testConfigurationStep.testRunDetails.howToFix.saml_user_attribute_missing.step1'),
      localizationKeys('configureSSO.testConfigurationStep.testRunDetails.howToFix.saml_user_attribute_missing.step2'),
      localizationKeys('configureSSO.testConfigurationStep.testRunDetails.howToFix.saml_user_attribute_missing.step3'),
    ],
  },
  saml_response_relaystate_missing: {
    kind: 'description',
    descriptionKey: localizationKeys(
      'configureSSO.testConfigurationStep.testRunDetails.howToFix.saml_response_relaystate_missing.description',
    ),
  },
  saml_email_address_domain_mismatch: {
    kind: 'description',
    descriptionKey: localizationKeys(
      'configureSSO.testConfigurationStep.testRunDetails.howToFix.saml_email_address_domain_mismatch.description',
    ),
  },
  oauth_access_denied: {
    kind: 'description',
    descriptionKey: localizationKeys(
      'configureSSO.testConfigurationStep.testRunDetails.howToFix.oauth_access_denied.description',
    ),
  },
  oauth_token_exchange_error: {
    kind: 'description',
    descriptionKey: localizationKeys(
      'configureSSO.testConfigurationStep.testRunDetails.howToFix.oauth_token_exchange_error.description',
    ),
  },
  oauth_fetch_user_error: {
    kind: 'steps',
    introKey: localizationKeys(
      'configureSSO.testConfigurationStep.testRunDetails.howToFix.oauth_fetch_user_error.intro',
    ),
    stepKeys: [
      localizationKeys('configureSSO.testConfigurationStep.testRunDetails.howToFix.oauth_fetch_user_error.step1'),
      localizationKeys('configureSSO.testConfigurationStep.testRunDetails.howToFix.oauth_fetch_user_error.step2'),
    ],
  },
};

export type TestRunHowToFixSectionProps = {
  errorCode: string | undefined;
};

export const useTestRunHowToFixModel = ({ errorCode }: TestRunHowToFixSectionProps) => {
  if (!errorCode) {
    return null;
  }
  const content = HOW_TO_FIX_BY_ERROR_CODE[errorCode];
  if (!content) {
    return null;
  }
  return { content, docsHref: `${DOCS_BASE_URL}#${errorCode.replaceAll('_', '-')}` };
};
