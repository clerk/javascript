import { __internal_useOrganizationBase } from '@clerk/shared/react/index';
import React from 'react';

import { useEnvironment } from '@/contexts';
import { Box, Col, descriptors, Flex, Heading, Icon, Text, useAppearance } from '@/customizables';
import { ApplicationLogo } from '@/elements/ApplicationLogo';
import { BoxIcon } from '@/icons';

type SetupFlowNavbarProps = React.PropsWithChildren<{
  title: string;
  contentRef: React.RefObject<HTMLDivElement>;
}>;

/**
 * PROTOTYPE ONLY — simplified copy of ConfigureSSONavbar (no NavBar/mobile
 * handling) so prototype flows can carry their own title without a
 * localization key. Shared by the identity-provider setup and Directory Sync
 * standalone hosts.
 */
export const SetupFlowNavbar = ({ title, children, contentRef }: SetupFlowNavbarProps): JSX.Element => {
  const { parsedOptions } = useAppearance();
  const {
    organizationSettings,
    displayConfig: { applicationName, logoImageUrl },
  } = useEnvironment();

  const hasLogo = Boolean(parsedOptions.logoImageUrl || logoImageUrl);

  return (
    <>
      <Col
        as='aside'
        sx={t => ({ gap: t.space.$4, padding: t.space.$4 })}
      >
        <Flex
          align='center'
          sx={t => ({
            gap: t.space.$2,
            padding: `${t.space.$none} ${t.space.$3}`,
            maxWidth: '100%',
          })}
        >
          {hasLogo ? (
            <ApplicationLogo
              sx={t => ({ width: t.space.$9, height: t.space.$9, borderRadius: t.radii.$md, overflow: 'hidden' })}
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
          sx={t => ({ fontSize: t.fontSizes.$lg, padding: `${t.space.$none} ${t.space.$3}` })}
        >
          {title}
        </Heading>
      </Col>

      <Col
        ref={contentRef}
        elementDescriptor={descriptors.scrollBox}
        sx={t => ({
          backgroundColor: t.colors.$colorBackground,
          position: 'relative',
          borderRadius: t.radii.$lg,
          width: '100%',
          overflow: 'hidden',
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$borderAlpha150,
          flex: 1,
        })}
      >
        {children}
      </Col>
    </>
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
      {organization?.name}
    </Text>
  );
};
