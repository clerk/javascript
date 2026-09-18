import { Card } from '../../components/card';
import { useFlowAutoFocus } from '../../components/flow';
import { Icon, IconFrame } from '../../components/icon';
import { Item } from '../../components/item';
import { useMessages } from '../../localization';
import type { UserProfileMfaAddableMethod } from './user-profile-mfa-section.view';

export interface UserProfileAddMfaViewProps {
  methods: readonly UserProfileMfaAddableMethod[];
  onSelect: (type: UserProfileMfaAddableMethod) => void;
}

const icons = {
  sms: 'security-phone',
  authenticator: 'security-lock-square',
  'backup-codes': 'numbers',
} as const;

export function UserProfileAddMfaView({ methods, onSelect }: UserProfileAddMfaViewProps) {
  const m = useMessages('userProfileMfa');
  const firstMethodRef = useFlowAutoFocus<HTMLDivElement>();
  return (
    <>
      <Card.Header>
        <Card.Title>{m.addDialog.title}</Card.Title>
        <Card.Description>{m.addDialog.description}</Card.Description>
      </Card.Header>
      <Card.Content>
        <Item.Group variant='outline'>
          {methods.map((type, index) => (
            <Item.Root
              key={type}
              ref={index === 0 ? firstMethodRef : undefined}
              size='lg'
              render={
                <button
                  type='button'
                  onClick={() => onSelect(type)}
                />
              }
            >
              <Item.Media>
                <IconFrame filled>
                  <Icon name={icons[type]} />
                </IconFrame>
              </Item.Media>
              <Item.Content>
                <Item.Label>{m.methods[type]}</Item.Label>
                <Item.Description>{m.addDialog.methods[type]}</Item.Description>
              </Item.Content>
              <Item.Actions>
                <Icon name='chevron-right' />
              </Item.Actions>
            </Item.Root>
          ))}
        </Item.Group>
      </Card.Content>
    </>
  );
}
