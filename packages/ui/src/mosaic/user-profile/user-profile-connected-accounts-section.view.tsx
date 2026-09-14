import { useRef } from 'react';

import { Section } from '../components/section';
import { UserProfileConnectedAccountRowView } from './user-profile-connected-account-row.view';
import { userProfileConnectedAccountsMessages as m } from './user-profile-connected-accounts.messages';

export interface UserProfileConnectedAccount {
  id: string;
  provider: string;
  identifier?: string;
  iconUrl?: string;
  connected?: boolean;
  canRemove?: boolean;
}

export interface UserProfileConnectedAccountsSectionViewProps {
  accounts: UserProfileConnectedAccount[];
  onConnect?: (id: string) => void;
  onManage?: (id: string) => void;
  onRemove?: (id: string) => void | Promise<void>;
}

export function UserProfileConnectedAccountsSectionView({
  accounts,
  onConnect,
  onManage,
  onRemove,
}: UserProfileConnectedAccountsSectionViewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  return (
    <Section.Root
      ref={sectionRef}
      tabIndex={-1}
    >
      <Section.Title>{m.title}</Section.Title>
      <Section.Group>
        {accounts.map(account => (
          <UserProfileConnectedAccountRowView
            key={account.id}
            account={account}
            onConnect={onConnect}
            onManage={onManage}
            onRemove={onRemove}
            removalFocusRef={sectionRef}
          />
        ))}
      </Section.Group>
    </Section.Root>
  );
}
