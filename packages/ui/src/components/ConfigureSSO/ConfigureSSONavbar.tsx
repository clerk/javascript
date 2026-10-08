import React from 'react';

import type { LocalizationKey } from '@/customizables';
import { localizationKeys } from '@/customizables';

import { useConfigureSSONavbarModel, useConfigureSSOOrganizationSubtitleModel } from './configure-sso-navbar.model';
import {
  ConfigureSSOMobileNavbarView,
  ConfigureSSONavbarView,
  OrganizationSubtitleView,
} from './configure-sso-navbar.view';

type ConfigureSSONavbarProps = React.PropsWithChildren<{
  contentRef: React.RefObject<HTMLDivElement>;
  title?: LocalizationKey;
}>;

export const ConfigureSSONavbar = ({
  children,
  contentRef,
  title = localizationKeys('configureSSO.navbar.title'),
}: ConfigureSSONavbarProps) => {
  const model = useConfigureSSONavbarModel();
  return (
    <ConfigureSSONavbarView
      contentRef={contentRef}
      title={title}
      organizationSubtitle={<OrganizationSubtitle />}
      mobileNavbar={<ConfigureSSOMobileNavbar title={title} />}
      {...model}
    >
      {children}
    </ConfigureSSONavbarView>
  );
};

const ConfigureSSOMobileNavbar = ({ title }: { title: LocalizationKey }) => {
  const model = useConfigureSSONavbarModel();
  return (
    <ConfigureSSOMobileNavbarView
      title={title}
      organizationSubtitle={<OrganizationSubtitle />}
      {...model}
    />
  );
};

const OrganizationSubtitle = (): JSX.Element | null => {
  const model = useConfigureSSOOrganizationSubtitleModel();
  return <OrganizationSubtitleView {...model} />;
};
