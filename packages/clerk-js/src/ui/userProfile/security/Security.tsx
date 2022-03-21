import { List } from '@clerk/shared/components/list';
import { TitledCard } from '@clerk/shared/components/titledCard';
import React from 'react';
import { useCoreUser, useEnvironment } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { PageHeading } from 'ui/userProfile/pageHeading';

import { ActiveDevicesCard } from './DevicesAndActivity/ActiveDevicesCard';

export function Security(): JSX.Element {
  const { userSettings } = useEnvironment();
  const { attributes } = userSettings;
  const { navigate } = useNavigate();
  const user = useCoreUser();

  const showPasswordRow =
    attributes.password.enabled && attributes.password.required;

  const showSecondFactorRow =
    attributes.phone_number.used_for_second_factor &&
    attributes.phone_number.second_factors.includes('phone_code');

  const buildPasswordRow = () => (
    <List.Item
      className='cl-list-item'
      key='password'
      itemTitle='Password'
      onClick={() => navigate('password')}
    >
      {user.passwordEnabled ? (
        <span className='cl-font-semibold'>••••••••••</span>
      ) : (
        <div className='cl-empty-list-item'>None</div>
      )}
    </List.Item>
  );

  const buildSecondFactorRow = () => {
    const twoFacOn = user.twoFactorEnabled();
    return (
      <List.Item
        className='cl-list-item'
        key='two-step'
        itemTitle='2-step verification'
        onClick={() => navigate('two-step')}
      >
        <div>
          Currently{' '}
          <span className='cl-font-semibold'>{twoFacOn ? 'ON' : 'OFF'}</span>
          {twoFacOn && (
            <span className='cl-list-item-subtitle'>
              <br />
              An additional authentication step is required when signing in
            </span>
          )}
        </div>
      </List.Item>
    );
  };

  return (
    <>
      <PageHeading
        title='Security'
        subtitle='Manage settings related to account security'
      />
      {(showPasswordRow || showSecondFactorRow) && (
        <TitledCard
          className='cl-themed-card'
          title='Sign in'
          subtitle='Manage authentication settings'
        >
          <List className='cl-titled-card-list'>
            {showPasswordRow && buildPasswordRow()}
            {showSecondFactorRow && buildSecondFactorRow()}
          </List>
        </TitledCard>
      )}
      <ActiveDevicesCard />
    </>
  );
}
