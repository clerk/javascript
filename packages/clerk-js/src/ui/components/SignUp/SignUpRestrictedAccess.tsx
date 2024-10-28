import { useClerk } from '@clerk/shared/react';

import { useSignUpContext } from '../../contexts';
import { Button, Flex, Icon, localizationKeys } from '../../customizables';
import { Card, Header } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { Block } from '../../icons';

export const SignUpRestrictedAccess = () => {
  const clerk = useClerk();
  const card = useCardState();
  const { signInUrl } = useSignUpContext();
  const supportEmail = useSupportEmail();

  const handleEmailSupport = () => {
    window.location.href = `mailto:${supportEmail}`;
  };

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Icon
            icon={Block}
            sx={t => ({
              margin: 'auto',
              width: t.sizes.$10,
              height: t.sizes.$10,
            })}
          />
          <Header.Title localizationKey={localizationKeys('signUp.restrictedAccess.title')} />
          <Header.Subtitle localizationKey={localizationKeys('signUp.restrictedAccess.subtitle')} />
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>
        {supportEmail && (
          <Flex
            direction='col'
            gap={4}
          >
            <Button
              localizationKey={localizationKeys('signUp.restrictedAccess.blockButton__emailSupport')}
              onClick={handleEmailSupport}
              hasArrow
            />
          </Flex>
        )}
      </Card.Content>
      <Card.Footer>
        <Card.Action elementId='signUp'>
          <Card.ActionText localizationKey={localizationKeys('signUp.restrictedAccess.actionText')} />
          <Card.ActionLink
            localizationKey={localizationKeys('signUp.restrictedAccess.actionLink')}
            to={clerk.buildUrlWithAuth(signInUrl)}
          />
        </Card.Action>
      </Card.Footer>
    </Card.Root>
  );
};
