// @ts-ignore
import { default as BinIcon } from '@clerk/shared/assets/icons/bin.svg';
// @ts-ignore
import { default as CheckCircleIcon } from '@clerk/shared/assets/icons/check-circle.svg';
import { List } from '@clerk/shared/components/list';
import { Menu } from '@clerk/shared/components/menu';
import { PhoneViewer } from '@clerk/shared/components/phoneInput';
import { Popover } from '@clerk/shared/components/popover';
import { Tag } from '@clerk/shared/components/tag';
import { TitledCard } from '@clerk/shared/components/titledCard';
import { PhoneNumberResource } from '@clerk/types';
import React, { useState } from 'react';
import { handleError } from 'ui/common';
import { Error as ErrorComponent } from 'ui/common/error';
import { useCoreUser } from 'ui/contexts';
import { TwoStepMethod, TwoStepMethodsToDisplayDataMap } from 'ui/userProfile/security/twoStepVerificationTypes';

export function ActiveMethodsCard(): JSX.Element | null {
  const [error, setError] = useState<string | undefined>();

  const user = useCoreUser();

  const enabledPhoneNumbers = user.phoneNumbers
    .filter(ph => ph.verification.status === 'verified')
    .filter(ph => ph.reservedForSecondFactor);

  const subtitleMessage = user.twoFactorEnabled()
    ? '2-step verification is currently enabled using these methods.'
    : '2-step verification is not enabled.';

  function onError(err: Error) {
    if (!err) {
      return;
    }
    handleError(err, [], setError);
  }

  return enabledPhoneNumbers.length === 0 ? null : (
    <TitledCard className='cl-themed-card' title='Active methods' subtitle={subtitleMessage}>
      <ErrorComponent>{error}</ErrorComponent>
      <List className='cl-titled-card-list'>
        {enabledPhoneNumbers.map(phone => (
          <PhoneListItem key={phone.id} phone={phone} onError={onError} />
        ))}
      </List>
    </TitledCard>
  );
}

function PhoneListItem({ phone, onError }: PhoneListItemProps): JSX.Element {
  const { title } = TwoStepMethodsToDisplayDataMap[TwoStepMethod.SMS];

  async function makeDefault() {
    try {
      await phone.makeDefaultSecondFactor();
    } catch (err) {
      onError(err);
    }
  }

  async function remove() {
    try {
      await phone.setReservedForSecondFactor({ reserved: false });
    } catch (err) {
      onError(err);
    }
  }

  return (
    <List.Item
      className='cl-list-item'
      hoverable={false}
      itemTitle={title}
      detailIcon={<Actions onMakeDefault={makeDefault} onRemove={remove} />}
    >
      <PhoneViewer phoneNumber={phone.phoneNumber} />
      {phone.defaultSecondFactor && <Tag color='primary'>Default</Tag>}
    </List.Item>
  );
}

type PhoneListItemProps = {
  phone: PhoneNumberResource;
  onError: (err: Error) => void;
};

function Actions({ onMakeDefault, onRemove }: ActionsProps): JSX.Element {
  return (
    <Popover>
      <Menu
        options={[
          {
            icon: <CheckCircleIcon />,
            label: 'Make default',
            handleSelect: onMakeDefault,
            isDestructiveAction: false,
          },
          {
            icon: <BinIcon />,
            label: 'Remove method',
            handleSelect: onRemove,
            isDestructiveAction: true,
          },
        ]}
      />
    </Popover>
  );
}

type ActionsProps = {
  onMakeDefault: () => void;
  onRemove: () => void;
};
