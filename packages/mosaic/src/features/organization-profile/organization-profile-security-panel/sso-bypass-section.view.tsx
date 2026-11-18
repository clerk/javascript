import * as stylex from '@stylexjs/stylex';

import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { Section } from '../../../components/section';
import { plural, useLocale, useMessages } from '../../../localization';
import { styles } from './organization-profile-security-panel.styles';

export interface SSOBypassSectionViewProps {
  count: number;
  isError: boolean;
  onManage: () => void;
}

export function SSOBypassSectionView({ count, isError, onManage }: SSOBypassSectionViewProps) {
  const m = useMessages('organizationProfile').security.ssoBypass;
  const locale = useLocale();
  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Content>
            <Section.Title>{m.title}</Section.Title>
          </Section.Content>
        </Section.Header>
        <Section.Body>
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Label>
                  <span {...stylex.props(styles.count)}>
                    {m.allowlistLabel}
                    {isError ? null : <Badge color='neutral'>{plural(m.count, count, locale)}</Badge>}
                  </span>
                </Section.Label>
                <Section.Description>{m.description}</Section.Description>
              </Section.Content>
              <Section.Actions>
                <ActionMenu
                  label={m.manageLabel}
                  actions={[{ label: m.manage, onClick: onManage }]}
                />
              </Section.Actions>
            </Section.Item>
            <Section.Error>{isError ? m.loadError : undefined}</Section.Error>
          </Section.Row>
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}
