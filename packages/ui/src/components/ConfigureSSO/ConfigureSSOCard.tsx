import { useOrganization } from '@clerk/shared/react';
import React, { type PropsWithChildren } from 'react';

import { useEnvironment } from '@/contexts';
import { Box, Col, descriptors, Flex, Icon, localizationKeys, Text, useAppearance } from '@/customizables';
import { ApplicationLogo } from '@/elements/ApplicationLogo';
import { NavBar, NavbarContextProvider } from '@/elements/Navbar';
import { ProfileCard } from '@/elements/ProfileCard';
import { BoxIcon } from '@/icons';

/**
 * Visual shell for the ConfigureSSO surface — ProfileCard with the
 * navbar sidebar and a body content area. Children render inside the
 * body Col with flex sizing so the wizard / pre-wizard gates can fill
 * the available space without needing their own sizing chrome
 */
export const ConfigureSSOCard = ({ children }: PropsWithChildren): JSX.Element => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { applicationName, logoImageUrl } = useEnvironment().displayConfig;
  const { organizationSettings } = useEnvironment();
  const { parsedOptions } = useAppearance();
  const hasLogo = Boolean(parsedOptions.logoImageUrl || logoImageUrl);

  return (
    <ProfileCard.Root
      sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 3fr', height: t.sizes.$176, overflow: 'hidden' })}
    >
      <NavbarContextProvider contentRef={contentRef}>
        <NavBar
          header={
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
                {organizationSettings.enabled && <OrganizationSidebarSubtitle />}
              </Col>
            </Flex>
          }
          titleSx={t => ({ fontSize: t.fontSizes.$lg })}
          title={localizationKeys('configureSSO.navbar.title')}
          routes={[]}
          contentRef={contentRef}
        />
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
            marginBlock: '-1px',
            marginInlineEnd: '-1px',
            flex: 1,
          })}
        >
          {children}
        </Col>
      </NavbarContextProvider>
    </ProfileCard.Root>
  );
};

const OrganizationSidebarSubtitle = (): JSX.Element | null => {
  const { organization } = useOrganization();

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
