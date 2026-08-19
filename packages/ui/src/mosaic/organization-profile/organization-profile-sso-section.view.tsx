import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Section } from '../components/section';
import { styles } from './organization-profile-security.styles';

export interface OrganizationProfileSsoConnection {
  id: string;
  domain: string;
  protocol: string;
  iconUrl?: string;
}

export interface OrganizationProfileSsoSectionViewProps {
  connections: OrganizationProfileSsoConnection[];
  onAdd?: () => void;
  onManage?: (id: string) => void;
}

export function OrganizationProfileSsoSectionView({
  connections,
  onAdd,
  onManage,
}: OrganizationProfileSsoSectionViewProps): ReactElement {
  return (
    <Section.Root>
      <Section.Title>Authentication</Section.Title>
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>SSO</Section.Label>
              <Section.Description>
                Require members with a matching email domain to sign in through your identity provider.
              </Section.Description>
            </Section.Content>
            {onAdd ? (
              <Section.Actions>
                <Button
                  color='neutral'
                  size='sm'
                  variant='outline'
                  onClick={onAdd}
                >
                  <Icon
                    name='plus'
                    placement='inline-start'
                    size='sm'
                  />
                  Add
                </Button>
              </Section.Actions>
            ) : null}
          </Section.Item>
          {connections.length > 0 ? (
            <Section.Items>
              {connections.map(connection => (
                <Section.Item key={connection.id}>
                  <Section.Media
                    size='lg'
                    {...stylex.props(styles.iconFrame)}
                  >
                    {connection.iconUrl ? (
                      <img
                        alt=''
                        src={connection.iconUrl}
                        {...stylex.props(styles.icon)}
                      />
                    ) : (
                      <Icon
                        aria-hidden
                        name='cog'
                        {...stylex.props(styles.icon)}
                      />
                    )}
                  </Section.Media>
                  <Section.Content>
                    <Section.Label>{connection.domain}</Section.Label>
                    <Section.Description>{connection.protocol}</Section.Description>
                  </Section.Content>
                  {onManage ? (
                    <Section.Actions>
                      <Button
                        aria-label={`Manage SSO for ${connection.domain}`}
                        color='neutral'
                        shape='square'
                        size='sm'
                        touchTarget={false}
                        variant='ghost'
                        onClick={() => onManage(connection.id)}
                      >
                        <Icon name='ellipsis' />
                      </Button>
                    </Section.Actions>
                  ) : null}
                </Section.Item>
              ))}
            </Section.Items>
          ) : null}
        </Section.Row>
      </Section.Group>
    </Section.Root>
  );
}
