import type React from 'react';

import type { LocalizationKey } from '@/customizables';
import { Box, Col, descriptors, Flex, Heading, Icon, Text } from '@/customizables';
import { ApplicationLogo } from '@/elements/ApplicationLogo';
import { NavBar, NavbarContextProvider } from '@/elements/Navbar';
import { BoxIcon } from '@/icons';
import { mqu } from '@/styledSystem';

import type {
  useConfigureSSONavbarModel,
  useConfigureSSOOrganizationSubtitleModel,
} from './configure-sso-navbar.model';

export const ConfigureSSONavbarView = ({
  children,
  contentRef,
  title,
  hasLogo,
  applicationName,
  organizationEnabled,
  organizationSubtitle,
  mobileNavbar,
}: React.PropsWithChildren<{
  contentRef: React.RefObject<HTMLDivElement>;
  title: LocalizationKey;
  organizationSubtitle: React.ReactNode;
  mobileNavbar: React.ReactNode;
}> &
  ReturnType<typeof useConfigureSSONavbarModel>) => {
  return (
    <NavbarContextProvider contentRef={contentRef}>
      <NavBar
        contentRef={contentRef}
        title={title}
        titleSx={t => ({ fontSize: t.fontSizes.$lg })}
        containerSx={{
          flexDirection: 'column-reverse',
          flex: 0,
        }}
        routes={[]}
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
              {organizationEnabled && organizationSubtitle}
            </Col>
          </Flex>
        }
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
          flex: 1,
        })}
      >
        {mobileNavbar}
        {children}
      </Col>
    </NavbarContextProvider>
  );
};

export const ConfigureSSOMobileNavbarView = ({
  title,
  hasLogo,
  applicationName,
  organizationEnabled,
  organizationSubtitle,
}: { title: LocalizationKey; organizationSubtitle: React.ReactNode } & ReturnType<
  typeof useConfigureSSONavbarModel
>) => {
  return (
    <Col
      as='header'
      elementDescriptor={descriptors.configureSSOMobileNavbar}
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
          {organizationEnabled && organizationSubtitle}
        </Col>
      </Flex>

      <Heading
        as='h3'
        localizationKey={title}
        sx={t => ({ fontSize: t.fontSizes.$lg })}
      />
    </Col>
  );
};

export const OrganizationSubtitleView = ({
  hasOrganization,
  organizationName,
}: ReturnType<typeof useConfigureSSOOrganizationSubtitleModel>): JSX.Element | null => {
  if (!hasOrganization) {
    return null;
  }
  return (
    <Text
      as='span'
      truncate
      sx={t => ({ color: t.colors.$colorMutedForeground })}
    >
      {organizationName}
    </Text>
  );
};
