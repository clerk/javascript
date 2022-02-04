import { Button } from '@clerk/shared/components/button';
import { List } from '@clerk/shared/components/list';
import { TitledCard } from '@clerk/shared/components/titledCard';
import React from 'react';
import { useNavigate } from 'ui/hooks';
import {
  TwoStepMethod,
  TwoStepMethodsToDisplayDataMap,
} from 'ui/userProfile/security/twoStepVerificationTypes';

export function AddMethodCard(): JSX.Element {
  const { navigate } = useNavigate();
  const availableMethods = [TwoStepMethod.SMS];

  function buildAddMethodRow(method: TwoStepMethod): JSX.Element {
    const {
      buttonTitle,
      linkPath,
      note,
      title,
    } = TwoStepMethodsToDisplayDataMap[method];
    return (
      <List.Item
        className='cl-list-item'
        detail={false}
        hoverable={false}
        key={method}
        itemTitle={title}
      >
        <div>
          <div>{note}</div>
          <Button
            className='cl-link-button'
            flavor='link'
            onClick={() => navigate(linkPath)}
          >
            {buttonTitle}
          </Button>
        </div>
      </List.Item>
    );
  }

  return (
    <TitledCard
      className='cl-themed-card'
      title='Add method'
      subtitle='Set up a new 2-step verification method'
    >
      <List className='cl-titled-card-list'>
        {availableMethods.map(buildAddMethodRow)}
      </List>
    </TitledCard>
  );
}
