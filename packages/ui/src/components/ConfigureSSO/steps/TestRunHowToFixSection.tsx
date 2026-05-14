import { Box, Flex, Heading, Icon, Link, localizationKeys, Span, Text } from '@/customizables';
import { ArrowRightIcon } from '@/icons';

import type { LocalizationKey } from '../../../localization';

const DOCS_BASE_URL = 'https://clerk.com/docs/guides/organizations/add-members/sso';

type HowToFixContent =
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

type TestRunHowToFixSectionProps = {
  errorCode: string | undefined;
};

export const TestRunHowToFixSection = ({ errorCode }: TestRunHowToFixSectionProps): JSX.Element | null => {
  if (!errorCode) {
    return null;
  }

  const content = HOW_TO_FIX_BY_ERROR_CODE[errorCode];
  const docsHref = `${DOCS_BASE_URL}#${errorCode.replaceAll('_', '-')}`;

  return (
    <Flex
      direction='col'
      gap={3}
      sx={t => ({
        borderTopWidth: t.borderWidths.$normal,
        borderTopStyle: t.borderStyles.$solid,
        borderTopColor: t.colors.$borderAlpha100,
        paddingTop: t.space.$4,
      })}
    >
      <Heading
        as='h3'
        textVariant='h3'
        localizationKey={localizationKeys('configureSSO.testConfigurationStep.testRunDetails.howToFix.sectionTitle')}
      />

      <Box
        sx={t => ({
          padding: t.space.$3,
          backgroundColor: t.colors.$colorBackground,
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$borderAlpha150,
          borderRadius: t.radii.$md,
          boxShadow: t.shadows.$cardContentShadow,
        })}
      >
        {content ? (
          <HowToFixContent content={content} />
        ) : (
          <Text
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.testConfigurationStep.testRunDetails.howToFix.generic')}
          />
        )}
      </Box>

      <Link
        href={docsHref}
        target='_blank'
        rel='noopener noreferrer'
        sx={t => ({
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: t.space.$1x5,
          paddingBlock: t.space.$1,
          paddingInline: t.space.$3,
          borderRadius: t.radii.$md,
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$borderAlpha150,
          color: t.colors.$colorForeground,
          fontSize: t.fontSizes.$sm,
          fontWeight: t.fontWeights.$medium,
          textDecoration: 'none',
          '&:hover': { backgroundColor: t.colors.$neutralAlpha50, textDecoration: 'none' },
        })}
      >
        <Span
          localizationKey={localizationKeys(
            'configureSSO.testConfigurationStep.testRunDetails.howToFix.actionLabel__viewDocumentation',
          )}
        />
        <Icon
          icon={ArrowRightIcon}
          size='sm'
        />
      </Link>
    </Flex>
  );
};

const HowToFixContent = ({ content }: { content: HowToFixContent }): JSX.Element => {
  if (content.kind === 'description') {
    return (
      <Text
        colorScheme='secondary'
        localizationKey={content.descriptionKey}
      />
    );
  }

  return (
    <Flex
      direction='col'
      gap={2}
    >
      {content.introKey ? (
        <Text
          colorScheme='secondary'
          localizationKey={content.introKey}
        />
      ) : null}
      <Box
        as='ol'
        sx={t => ({
          margin: 0,
          paddingInlineStart: t.space.$5,
          display: 'flex',
          flexDirection: 'column',
          gap: t.space.$1,
        })}
      >
        {content.stepKeys.map((stepKey, idx) => (
          <Box
            key={idx}
            as='li'
            sx={t => ({ color: t.colors.$colorMutedForeground })}
          >
            <Text
              as='span'
              colorScheme='secondary'
              localizationKey={stepKey}
            />
          </Box>
        ))}
      </Box>
    </Flex>
  );
};
