import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Destructive } from '../../../blocks/destructive';
import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { Tooltip } from '../../../components/tooltip';
import { VisuallyHidden } from '../../../components/visually-hidden';
import { InformationCircle } from '../../../icons/glyphs/information-circle';
import { fill, useMessages } from '../../../localization';
import { truncationStyles } from '../../../styles/typography.styles';
import { UserProfileProviderMedia } from '../../user-profile/user-profile-provider-media';
import { styles } from './organization-profile-security-panel.styles';
import { SSO_STATUS_COLORS } from './sso-connections.utils';
import type { SSOConnectionRow, SSOSectionController } from './sso-section.controller';

export type SSOSectionViewProps = Omit<SSOSectionController, 'managed' | 'onManagedOpenChange' | 'managedFinalFocus'>;

export function SSOSectionView({
  rows,
  isDisabled,
  isError,
  onRetry,
  enrollmentRoleName,
  onManage,
  onSetActive,
  remove,
  registerTrigger,
  removalFinalFocus,
  sectionRef,
  organizationName,
}: SSOSectionViewProps) {
  const m = useMessages('organizationProfile').security.sso;

  return (
    <Section.Root ref={sectionRef}>
      <Section.Group>
        <Section.Header>
          <Section.Content>
            <Section.Title>{m.title}</Section.Title>
            <Section.Description>{m.description}</Section.Description>
          </Section.Content>
          <Section.Actions>
            <Tooltip.Root>
              <Tooltip.Trigger
                render={
                  <Button
                    variant='ghost'
                    color='neutral'
                    shape='square'
                    size='sm'
                  />
                }
              >
                <Icon glyph={InformationCircle} />
                <VisuallyHidden>{m.infoLabel}</VisuallyHidden>
              </Tooltip.Trigger>
              <Tooltip.Popup>
                {enrollmentRoleName ? fill(m.enrollment, { role: enrollmentRoleName }) : m.enrollmentNoRole}
              </Tooltip.Popup>
            </Tooltip.Root>
          </Section.Actions>
        </Section.Header>
        <Section.Body>
          {isError ? (
            <Section.Row>
              <Section.Item>
                <Section.Content>
                  <Section.Label>{m.loadError}</Section.Label>
                </Section.Content>
                <Section.Actions>
                  <Button
                    size='sm'
                    variant='outline'
                    color='neutral'
                    onClick={onRetry}
                  >
                    {m.retry}
                  </Button>
                </Section.Actions>
              </Section.Item>
            </Section.Row>
          ) : rows.length === 0 ? (
            <Section.Row>
              <Section.Item>
                <Section.Content>
                  <Section.Description>{m.empty}</Section.Description>
                </Section.Content>
              </Section.Item>
            </Section.Row>
          ) : (
            rows.map(row => (
              <SSOConnectionRowView
                key={row.id}
                row={row}
                isDisabled={isDisabled}
                onManage={onManage}
                onSetActive={onSetActive}
                onRemove={remove ? () => remove.open(row) : undefined}
                triggerRef={registerTrigger(row.id)}
              />
            ))
          )}
        </Section.Body>
      </Section.Group>
      {remove ? (
        <Destructive
          controller={remove}
          finalFocus={removalFinalFocus}
          title={m.removeDialog.title}
          description={connection => fill(m.removeDialog.description, { name: connection.name })}
          fieldLabel={fill(m.removeDialog.fieldLabel, { phrase: organizationName })}
          confirmationValue={organizationName}
          actionLabel={m.removeDialog.action}
          cancelLabel={m.removeDialog.cancel}
        />
      ) : null}
    </Section.Root>
  );
}

function SSOConnectionRowView({
  row,
  isDisabled,
  onManage,
  onSetActive,
  onRemove,
  triggerRef,
}: {
  row: SSOConnectionRow;
  isDisabled: boolean;
  onManage: (id: string) => void;
  onSetActive: (id: string, active: boolean) => void;
  onRemove: (() => void) | undefined;
  triggerRef: Ref<HTMLButtonElement>;
}) {
  const m = useMessages('organizationProfile').security.sso;
  const providerLabel = m.providers[row.providerKey];
  const description = row.domains.length > 0 ? row.domains.join(', ') : providerLabel;

  return (
    <Section.Row>
      <Section.Item>
        <UserProfileProviderMedia
          provider={row.name}
          iconUrl={row.iconUrl}
        />
        <Section.Content>
          <Section.Label>
            <span
              title={row.name}
              {...stylex.props(truncationStyles.singleLine)}
            >
              {row.name}
            </span>
          </Section.Label>
          <Section.Description
            title={description}
            xstyle={truncationStyles.singleLine}
          >
            {description}
          </Section.Description>
        </Section.Content>
        <Section.Actions>
          <span {...stylex.props(styles.count)}>
            <Badge color={SSO_STATUS_COLORS[row.status]}>{m.status[row.status]}</Badge>
            <ActionMenu
              triggerRef={triggerRef}
              label={fill(m.manageLabel, { name: row.name })}
              disabled={isDisabled && !row.isPending}
              actions={[
                { label: m.manage, onClick: () => onManage(row.id) },
                ...(row.status === 'active'
                  ? [
                      {
                        label: m.deactivate,
                        status: row.isPending ? ('pending' as const) : ('idle' as const),
                        onClick: () => onSetActive(row.id, false),
                      },
                    ]
                  : row.status === 'inactive'
                    ? [
                        {
                          label: m.activate,
                          status: row.isPending ? ('pending' as const) : ('idle' as const),
                          onClick: () => onSetActive(row.id, true),
                        },
                      ]
                    : []),
                ...(onRemove && !row.isPending
                  ? [{ label: m.remove, color: 'negative' as const, onClick: onRemove }]
                  : []),
              ]}
            />
          </span>
        </Section.Actions>
      </Section.Item>
      <Section.Error>{row.error}</Section.Error>
    </Section.Row>
  );
}
