import { List } from '@clerk/shared/components/list';
import { Tag, VerificationStatusTag } from '@clerk/shared/components/tag';
import React from 'react';
import { useCoreUser } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';

export function ProfileEmailAddresses(): JSX.Element {
  const { navigate } = useNavigate();
  const user = useCoreUser();

  return (
    <List.Item
      className='cl-list-item'
      key='email'
      itemTitle='Email'
      onClick={() => navigate('email-addresses')}
    >
      {user.emailAddresses.length === 0 ? (
        <div className='cl-empty-list-item'>None</div>
      ) : (
        <div className='cl-list-item-entry'>
          {user.emailAddresses.map(emailIdent => (
            <div key={emailIdent.id}>
              {emailIdent.emailAddress}
              {user.isPrimaryIdentification(emailIdent) && <Tag color='primary'>Primary</Tag>}
              {emailIdent.verification.status && (
                <VerificationStatusTag
                  className='cl-tag'
                  status={emailIdent.verification.status}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </List.Item>
  );
}
