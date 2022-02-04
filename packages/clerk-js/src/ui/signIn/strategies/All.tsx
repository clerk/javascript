import { Button } from '@clerk/shared/components/button';
import { OAuthStrategy, SignInFactor, SignInStrategyName } from '@clerk/types';
import React from 'react';
import { Separator } from 'ui/common';
import { useSupportEmail } from 'ui/hooks/useSupportEmail';
import { allStrategiesButtonsComparator } from 'ui/signIn/strategies/factorSortingUtils';

import { OAuth } from './OAuth';

export function getButtonLabel(factor: SignInFactor): string {
  switch (factor.strategy) {
    case 'email_link':
      return `Send magic link to ${factor.safe_identifier}`;
    case 'email_code':
      return `Email code to ${factor.safe_identifier}`;
    case 'phone_code':
      return `Send code to ${factor.safe_identifier}`;
    case 'password':
      return 'Sign in with your password';
    default:
      throw `Invalid sign in strategy: "${factor.strategy}"`;
  }
}

const supportedStrategies: SignInStrategyName[] = [
  'email_code',
  'password',
  'phone_code',
  'email_link',
];
function isSupportedStrategy(strategy: SignInStrategyName): boolean {
  return supportedStrategies.includes(strategy);
}

export type AllProps = {
  factors: SignInFactor[];
  selectFactor: (factor: SignInFactor) => void;
};

export function All({ selectFactor, factors }: AllProps): JSX.Element {
  const supportEmail = useSupportEmail();
  const firstPartyFactors = factors.filter(
    f => !f.strategy.startsWith('oauth_'),
  );
  const oauthFactors = factors.filter(f => f.strategy.startsWith('oauth_'));
  const oauthStrategies = oauthFactors.map(f => f.strategy) as OAuthStrategy[];

  const handleClick = (e: React.MouseEvent, strategy: SignInFactor) => {
    e.preventDefault();
    selectFactor(strategy);
  };

  const href = `mailto:${supportEmail}`;

  const firstPartyButtons = firstPartyFactors
    .filter(f => isSupportedStrategy(f.strategy))
    .sort(allStrategiesButtonsComparator)
    .map((factor, i) => (
      <Button
        key={`button-${i}`}
        className='cl-primary-button'
        onClick={e => handleClick(e, factor)}
      >
        {getButtonLabel(factor)}
      </Button>
    ));

  return (
    <>
      <OAuth oauthOptions={oauthStrategies} />
      {oauthStrategies.length > 0 && firstPartyButtons.length > 0 && (
        <Separator />
      )}
      {firstPartyButtons}
      <div className='cl-auth-form-link cl-auth-trouble-link'>
        <a href={href} title='Contact support'>
          I am having trouble signing in
        </a>
      </div>
    </>
  );
}
