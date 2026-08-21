import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Section } from '../components/section';
import { styles } from './organization-profile-security.styles';

export interface OrganizationProfileVerifiedDomain {
  id: string;
  name: string;
  enrollmentModeLabel?: string;
  iconUrl?: string;
}

export interface OrganizationProfileVerifiedDomainsSectionViewProps {
  domains: OrganizationProfileVerifiedDomain[];
  onAdd?: () => void;
  onManage?: (id: string) => void;
}

export function OrganizationProfileVerifiedDomainsSectionView({
  domains,
  onAdd,
  onManage,
}: OrganizationProfileVerifiedDomainsSectionViewProps): ReactElement {
  return (
    <Section.Root>
      <Section.Title>Access</Section.Title>
      <Section.Group>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Verified domains</Section.Label>
              <Section.Description>
                Allow users to join automatically or request access via verified email domain.
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
          {domains.length > 0 ? (
            <Section.Items>
              {domains.map(domain => (
                <Section.Item key={domain.id}>
                  {/* TODO: Temporary provider-media frame; replace with Mosaic IconFrame while preserving image and fallback icons. */}
                  <Section.Media
                    size='lg'
                    {...stylex.props(styles.iconFrame)}
                  >
                    {domain.iconUrl ? (
                      <img
                        alt=''
                        src={domain.iconUrl}
                        {...stylex.props(styles.icon)}
                      />
                    ) : (
                      <Icon
                        aria-hidden
                        name='building'
                        {...stylex.props(styles.icon)}
                      />
                    )}
                  </Section.Media>
                  <Section.Content>
                    <Section.Label>{domain.name}</Section.Label>
                  </Section.Content>
                  {domain.enrollmentModeLabel ? <Badge color='neutral'>{domain.enrollmentModeLabel}</Badge> : null}
                  {onManage ? (
                    <Section.Actions>
                      <Button
                        aria-label={`Manage ${domain.name}`}
                        color='neutral'
                        shape='square'
                        size='sm'
                        touchTarget={false}
                        variant='ghost'
                        onClick={() => onManage(domain.id)}
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
