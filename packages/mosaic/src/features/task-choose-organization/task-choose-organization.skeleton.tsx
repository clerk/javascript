import { Card } from '../../components/card';
import { Item } from '../../components/item';
import { Skeleton } from '../../components/skeleton';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useMessages } from '../../localization';
import { RowAvatar } from '../switcher/switcher-avatar.view';
import { TaskChooseOrganizationHeader, TaskChooseOrganizationSignOut } from './task-choose-organization.view';

const PLACEHOLDER_ORGANIZATIONS = ['Acme Corporation', 'Globex'];

export function TaskChooseOrganizationSkeleton({
  canCreate,
  identifier,
  renderBranding,
}: {
  canCreate: boolean;
  identifier?: string;
  renderBranding: boolean;
}) {
  const m = useMessages('organizationList');
  return (
    <Card.Root renderBranding={renderBranding}>
      <TaskChooseOrganizationHeader canCreate={canCreate} />
      <Card.Content>
        <VisuallyHidden role='status'>{m.loading}</VisuallyHidden>
        <Item.Group
          variant='outline'
          aria-hidden
        >
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
    </Card.Root>
  );
}
