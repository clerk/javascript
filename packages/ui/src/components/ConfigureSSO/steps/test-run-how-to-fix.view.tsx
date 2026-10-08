import { Box, descriptors, Flex, Heading, Icon, Link, localizationKeys, Span, Text } from '@/customizables';
import { ArrowRight } from '@/icons';

import type { HowToFixContent as HowToFixContentType } from './test-run-how-to-fix.model';

export const TestRunHowToFixView = ({
  content,
  docsHref,
}: {
  content: HowToFixContentType;
  docsHref: string;
}): JSX.Element => {
  return (
    <Flex
      elementDescriptor={descriptors.configureSSOTestRunHowToFixSection}
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
        <HowToFixContent content={content} />

        <Link
          elementDescriptor={descriptors.configureSSOTestRunHowToFixDocsLink}
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
            marginTop: t.space.$2,
            '&:hover': { backgroundColor: t.colors.$neutralAlpha50, textDecoration: 'none' },
          })}
        >
          <Span
            localizationKey={localizationKeys(
              'configureSSO.testConfigurationStep.testRunDetails.howToFix.actionLabel__viewDocumentation',
            )}
          />
          <Icon
            icon={ArrowRight}
            size='sm'
          />
        </Link>
      </Box>
    </Flex>
  );
};

const HowToFixContent = ({ content }: { content: HowToFixContentType }): JSX.Element => {
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
          listStyleType: 'decimal',
          display: 'flex',
          flexDirection: 'column',
          gap: t.space.$1,
        })}
      >
        {content.stepKeys.map(stepKey => (
          <Box
            key={stepKey.key}
            as='li'
            sx={t => ({
              color: t.colors.$colorMutedForeground,
              fontSize: t.fontSizes.$sm,
              '&::marker': {
                color: t.colors.$colorMutedForeground,
                fontSize: t.fontSizes.$sm,
              },
            })}
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
