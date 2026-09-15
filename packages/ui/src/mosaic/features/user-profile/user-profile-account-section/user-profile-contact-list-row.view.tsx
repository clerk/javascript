import type { ReactNode } from 'react';
import { useId } from 'react';

import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Section } from '../../../components/section';
import { startViewTransition } from '../../../utils/view-transition';
import type { UserProfileMenuAction } from '../user-profile-action-menu';
import { UserProfileActionMenu } from '../user-profile-action-menu';
import { styles } from '../user-profile-profile-panel.styles';
import { fill, userProfileAccountSectionBase as m } from './user-profile-account-section.messages';
import { motionStyles } from './user-profile-account-section.styles';
import {
  contactBadgeName,
  contactPartNames,
  contactPromoteStyles,
  orderPrimaryFirst,
} from './user-profile-contact-motion';

export interface UserProfileContactListRowViewProps {
  addAction?: ReactNode;
  kind: 'email' | 'phone';
  label: string;
  items: Array<{ id: string; value: string; isDefault?: boolean; isVerified?: boolean; canRemove?: boolean }>;
  /** Lead with the primary contact instead of the order the items arrived in. */
  sortPrimaryFirst?: boolean;
  /**
   * Play the reorder that follows `onSetPrimary` as a view transition. Requires `onSetPrimary` to
   * apply its change synchronously, since the transition captures the frame it produces.
   */
  animateChanges?: boolean;
  onAdd?: () => void;
  onVerify?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (id: string) => void;
  renderActionDialog?: (item: { id: string; value: string }) => ReactNode;
}

export function UserProfileContactListRowView({
  kind,
  label,
  items,
  sortPrimaryFirst = false,
  animateChanges = false,
  onAdd,
  onVerify,
  onSetPrimary,
  onRemove,
  addAction,
  renderActionDialog,
}: UserProfileContactListRowViewProps) {
  const emptyDescription = m[kind].empty;
  const instanceId = useId();
  const ordered = sortPrimaryFirst ? orderPrimaryFirst(items) : items;
  const partNames = (id: string) => contactPartNames(instanceId, kind, id);
  const badgeName = contactBadgeName(instanceId, kind);
  const rowNames = ordered.flatMap(item => partNames(item.id));

  const setPrimary = onSetPrimary
    ? (id: string) => {
        if (!animateChanges) {
          onSetPrimary(id);
          return;
        }
        startViewTransition({
          update: () => onSetPrimary(id),
          css: contactPromoteStyles({ rowNames, promotedNames: partNames(id), badgeName }),
        });
      }
    : undefined;

  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{label}</Section.Label>
        </Section.Content>
        {addAction ? (
          <Section.Actions>{addAction}</Section.Actions>
        ) : onAdd ? (
          <Section.Actions>
            <Button
              aria-label={m[kind].add}
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
              {m.add}
            </Button>
          </Section.Actions>
        ) : null}
      </Section.Item>
      <Section.Items>
        {ordered.length === 0 ? (
          <Section.Item>
            <Section.Content>
              <Section.Description>{emptyDescription}</Section.Description>
            </Section.Content>
          </Section.Item>
        ) : (
          ordered.map(item => {
            const actions: UserProfileMenuAction[] = [];

            if (item.isVerified === false && onVerify) {
              actions.push({
                label: item.isDefault ? m.completeVerification : m[kind].verify,
                onClick: () => onVerify(item.id),
              });
            } else if (!item.isDefault && item.isVerified === true && setPrimary) {
              actions.push({ label: m.setPrimary, onClick: () => setPrimary(item.id) });
            }

            if (onRemove && item.canRemove !== false) {
              actions.push({
                label: m[kind].remove,
                color: 'negative',
                onClick: () => onRemove(item.id),
              });
            }

            return (
              <Section.Item key={item.id}>
                <Section.Content xstyle={motionStyles.name(animateChanges ? partNames(item.id)[0] : null)}>
                  <Section.Description xstyle={styles.contactValue}>
                    <span>{item.value}</span>
                    {item.isDefault ? (
                      <Badge
                        color='neutral'
                        xstyle={motionStyles.name(animateChanges ? badgeName : null)}
                      >
                        {m.primary}
                      </Badge>
                    ) : null}
                  </Section.Description>
                </Section.Content>
                {actions.length > 0 ? (
                  <Section.Actions xstyle={motionStyles.name(animateChanges ? partNames(item.id)[1] : null)}>
                    <UserProfileActionMenu
                      actions={actions}
                      label={fill(m.manageValue, { value: item.value })}
                    >
                      {renderActionDialog?.(item)}
                    </UserProfileActionMenu>
                  </Section.Actions>
                ) : null}
              </Section.Item>
            );
          })
        )}
      </Section.Items>
    </Section.Row>
  );
}
