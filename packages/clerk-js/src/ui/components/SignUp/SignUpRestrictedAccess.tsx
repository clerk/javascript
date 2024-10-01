import { useClerk } from '@clerk/shared/react';

import { useSignUpContext } from '../../contexts';
import { Icon, localizationKeys } from '../../customizables';
import { Card, Header } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { Block } from '../../icons';
export const SignUpRestrictedAccess = () => {
  const clerk = useClerk();
  const card = useCardState();
  const { signInUrl } = useSignUpContext();

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Icon
            icon={Block}
            sx={t => ({
              margin: 'auto',
              width: t.sizes.$12,
              height: t.sizes.$12,
            })}
          />
          <Header.Title localizationKey={localizationKeys('signUp.restrictedAccess.title')} />
          <Header.Subtitle localizationKey={localizationKeys('signUp.restrictedAccess.subtitle')} />
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>
        <Card.Action elementId='signUp'>
          <Card.ActionLink
            localizationKey={localizationKeys('signUp.restrictedAccess.actionLink')}
            to={clerk.buildUrlWithAuth(signInUrl)}
          />
        </Card.Action>
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
};
