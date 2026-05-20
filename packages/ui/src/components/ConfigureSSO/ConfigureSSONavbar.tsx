import { useOrganization } from '@clerk/shared/react/index';
import React from 'react';

import { useEnvironment } from '@/contexts';
import { Box, Col, Flex, Icon, localizationKeys, Text, useAppearance } from '@/customizables';
import { ApplicationLogo } from '@/elements/ApplicationLogo';
import { NavBar, NavbarContextProvider } from '@/elements/Navbar';
import { BoxIcon } from '@/icons';

type ConfigureSSONavbarProps = React.PropsWithChildren<{
  contentRef: React.RefObject<HTMLDivElement>;
}>;

export const ConfigureSSONavbar = ({ children, contentRef }: ConfigureSSONavbarProps) => {
  const { parsedOptions } = useAppearance();
  const {
    organizationSettings,
    displayConfig: { applicationName, logoImageUrl },
  } = useEnvironment();

  const hasLogo = Boolean(parsedOptions.logoImageUrl || logoImageUrl);

  return (
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
        containerSx={{
          flexDirection: 'column-reverse',
          flex: 0,
        }}
        title={localizationKeys('configureSSO.navbar.title')}
        routes={[]}
        contentRef={contentRef}
      />
      {children}
    </NavbarContextProvider>
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
