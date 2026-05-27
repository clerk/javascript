import { __internal_useOrganizationBase } from '@clerk/shared/react';

import { useEnvironment } from '@/contexts';
import { Box, Col, Flex, Heading, Icon, localizationKeys, Text, useAppearance } from '@/customizables';
import { ApplicationLogo } from '@/elements/ApplicationLogo';
import { BoxIcon } from '@/icons';
import { mqu } from '@/styledSystem';

export const ConfigureSSOMobileHeader = () => {
  const { parsedOptions } = useAppearance();
  const {
    organizationSettings,
    displayConfig: { applicationName, logoImageUrl },
  } = useEnvironment();

  const hasLogo = Boolean(parsedOptions.logoImageUrl || logoImageUrl);

  return (
    <Col
      as='header'
      sx={t => ({
        display: 'none',
        [mqu.md]: {
          display: 'flex',
        },
        gap: t.space.$4,
        padding: t.space.$5,
        borderBottomWidth: t.borderWidths.$normal,
        borderBottomStyle: t.borderStyles.$solid,
        borderBottomColor: t.colors.$borderAlpha100,
      })}
    >
      <Flex
        align='center'
        sx={t => ({
          gap: t.space.$2,
          maxWidth: '100%',
        })}
      >
        {hasLogo ? (
          <ApplicationLogo
            sx={t => ({
              width: t.space.$9,
              height: t.space.$9,
              borderRadius: t.radii.$md,
              overflow: 'hidden',
            })}
          />
        ) : (
          <Box
            sx={t => ({
              width: t.space.$9,
              height: t.space.$9,
              flexShrink: 0,
              borderRadius: t.radii.$md,
              backgroundColor: t.colors.$primary500,
              color: t.colors.$colorPrimaryForeground,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            })}
            aria-hidden
          >
            <Icon
              icon={BoxIcon}
              sx={t => ({ width: t.sizes.$4, height: t.sizes.$4 })}
            />
          </Box>
        )}

        <Col sx={{ minWidth: 0 }}>
          <Text
            as='p'
            truncate
          >
            {applicationName}
          </Text>
          {organizationSettings.enabled && <OrganizationSubtitle />}
        </Col>
      </Flex>

      <Heading
        as='h3'
        localizationKey={localizationKeys('configureSSO.navbar.title')}
        sx={t => ({ fontSize: t.fontSizes.$lg })}
      />
    </Col>
  );
};

const OrganizationSubtitle = (): JSX.Element | null => {
  const organization = __internal_useOrganizationBase();

  if (!organization) {
    return null;
  }

  return (
    <Text
      as='span'
      truncate
      sx={t => ({ color: t.colors.$colorMutedForeground })}
    >
      {organization.name}
    </Text>
  );
};
