import { Card } from '../../components/card';
import { Item } from '../../components/item';
import { Skeleton } from '../../components/skeleton';
import { RowAvatar } from '../../components/switcher/switcher-avatar';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useMessages } from '../../localization';
import {
  TaskChooseOrganizationCard,
  TaskChooseOrganizationHeader,
  TaskChooseOrganizationSignOut,
} from './task-choose-organization.view';

const PLACEHOLDER_ORGANIZATIONS = ['Acme Corporation', 'Globex'];

export function TaskChooseOrganizationSkeleton({
  canCreate,
  identifier,
  renderBranding,
  applicationLogoUrl,
}: {
  canCreate: boolean;
  identifier?: string;
  renderBranding: boolean;
  applicationLogoUrl?: string;
}) {
  const m = useMessages('organizationList');
  return (
    <TaskChooseOrganizationCard
      renderBranding={renderBranding}
      applicationLogoUrl={applicationLogoUrl}
    >
      <TaskChooseOrganizationHeader canCreate={canCreate} />
      <Card.Content>
        <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
        <Item.Group aria-hidden>
          {PLACEHOLDER_ORGANIZATIONS.map(name => (
            <Item.Root key={name}>
              <Skeleton shape='rounded'>
                <Item.Media>
                  <RowAvatar
                    name={name}
                    shape='square'
                    size='fit'
                  />
                </Item.Media>
              </Skeleton>
              <Item.Content>
                <Item.Label>
                  <Skeleton>{name}</Skeleton>
                </Item.Label>
              </Item.Content>
            </Item.Root>
          ))}
        </Item.Group>
      </Card.Content>
      <TaskChooseOrganizationSignOut identifier={identifier} />
    </TaskChooseOrganizationCard>
  );
}
