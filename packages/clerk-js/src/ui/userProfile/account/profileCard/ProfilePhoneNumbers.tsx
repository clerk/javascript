import React from 'react';
import { useNavigate } from 'ui/hooks';
import { useCoreUser } from 'ui/contexts';
import { List } from '@clerk/shared/components/list';
import { Tag, VerificationStatusTag } from '@clerk/shared/components/tag';
import { PhoneViewer } from '@clerk/shared/components/phoneInput';

export function ProfilePhoneNumbers(): JSX.Element {
  const { navigate } = useNavigate();
  const user = useCoreUser();

  return (
    <List.Item
      className='cl-list-item'
      key='phone-number'
      itemTitle='Phone number'
      onClick={() => navigate('phone-numbers')}
    >
      {user.phoneNumbers.length === 0 ? (
        <div className='cl-empty-list-item'>None</div>
      ) : (
        <div className='cl-list-item-entry'>
          {user.phoneNumbers.map(phoneIdent => (
            <div key={phoneIdent.id}>
              <PhoneViewer phoneNumber={phoneIdent.phoneNumber} />
              {user.isPrimaryIdentification(phoneIdent) && (
                <Tag color='primary'>Primary</Tag>
              )}
              {phoneIdent.verification.status && (
                <VerificationStatusTag
                  className='cl-tag'
                  status={phoneIdent.verification.status}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </List.Item>
  );
}
