import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import { Icon, IconFrame } from '../../../components/icon';
import { Item } from '../../../components/item';
import { Spinner } from '../../../components/spinner';
import { ChevronRight } from '../../../icons/glyphs/chevron-right';
import { Numbers } from '../../../icons/glyphs/numbers';
import { SecurityLockSquare } from '../../../icons/glyphs/security-lock-square';
import { SecurityPhone } from '../../../icons/glyphs/security-phone';
import { useMessages } from '../../../localization';
import type { UserProfileMfaAddableMethod } from './user-profile-mfa-section.view';

export interface UserProfileAddMfaViewProps {
  pendingMethod?: 'authenticator' | 'backup-codes';
  errorMessage?: string;
  methods: readonly UserProfileMfaAddableMethod[];
  onSelect: (type: UserProfileMfaAddableMethod) => void;
}

const icons = {
  sms: SecurityPhone,
  authenticator: SecurityLockSquare,
  'backup-codes': Numbers,
} as const;

export function UserProfileAddMfaView({ methods, onSelect, pendingMethod, errorMessage }: UserProfileAddMfaViewProps) {
  const m = useMessages('userProfile').mfa;
  const firstMethodRef = useFlowAutoFocus<HTMLDivElement>();
  return (
    <>
      <Card.Header>
        <Card.Title>{m.addDialog.title}</Card.Title>
        <Card.Description>{m.addDialog.description}</Card.Description>
      </Card.Header>
      <Card.Content>
        <Card.Banner
          role='alert'
          color='negative'
        >
          {errorMessage}
        </Card.Banner>
        <Item.Group variant='outline'>
          {methods.map((type, index) => (
            <Item.Root
              key={type}
              ref={index === 0 ? firstMethodRef : undefined}
              size='lg'
              render={
                <button
                  type='button'
                  disabled={pendingMethod !== undefined}
                  aria-busy={pendingMethod === type}
                  onClick={() => onSelect(type)}
                />
              }
            >
              <Item.Media>
                <IconFrame
                  filled
                  bordered={false}
                >
                  <Icon glyph={icons[type]} />
                </IconFrame>
              </Item.Media>
              <Item.Content>
                <Item.Label>{m.methods[type]}</Item.Label>
                <Item.Description>{m.addDialog.methods[type]}</Item.Description>
              </Item.Content>
              <Item.Actions>{pendingMethod === type ? <Spinner /> : <Icon glyph={ChevronRight} />}</Item.Actions>
            </Item.Root>
          ))}
        </Item.Group>
      </Card.Content>
    </>
  );
}
