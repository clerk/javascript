import type { ReactNode } from 'react';

import { Button } from '../../../components/button';
import { Flow } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { Panel } from '../../../components/panel';
import { ArrowLeft } from '../../../icons/glyphs/arrow-left';
import { useMessages } from '../../../localization';
import { themeProps } from '../../../props';
import { rtl } from '../../../styles/rtl.styles';
import type { SecurityPanelController } from './organization-profile-security-panel.controller';
import { styles } from './organization-profile-security-panel.styles';

export interface OrganizationProfileSecurityPanelViewProps extends SecurityPanelController {
  overview: ReactNode;
  ssoBypass: ReactNode;
}

export function OrganizationProfileSecurityPanelView({
  page,
  direction,
  onBack,
  overview,
  ssoBypass,
}: OrganizationProfileSecurityPanelViewProps) {
  const m = useMessages('organizationProfile');
  return (
    <Panel.Root render={<div {...themeProps('organization-profile-security-panel')} />}>
      {page === 'overview' ? null : (
        <Button
          variant='ghost'
          color='neutral'
          size='sm'
          xstyle={styles.back}
          onClick={onBack}
        >
          <Icon
            glyph={ArrowLeft}
            xstyle={rtl.mirror}
          />
          {m.security.back}
        </Button>
      )}
      <Panel.Title>{page === 'ssoBypass' ? m.security.ssoBypassPage.title : m.pages.security}</Panel.Title>
      <Flow.Root
        value={page}
        direction={direction}
        state={{ overview, ssoBypass }}
      >
        {current => (
          <>
            <Flow.Step ids={['overview']}>
              <Panel.Sections>{current.overview}</Panel.Sections>
            </Flow.Step>
            <Flow.Step ids={['ssoBypass']}>{current.ssoBypass}</Flow.Step>
          </>
        )}
      </Flow.Root>
    </Panel.Root>
  );
}
