import { SIGN_UP_MODES } from '@clerk/shared/internal/clerk-js/constants';
import { useClerk } from '@clerk/shared/react';

import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';

import { useEnvironment, useSignUpContext } from '../../contexts';
import { Button, Flex, Icon, localizationKeys } from '../../customizables';
import { useCardState } from '../../elements/contexts';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { Block } from '../../icons';
import { useRouter } from '../../router';

export const SignUpRestrictedAccess = () => {
  const clerk = useClerk();
  const card = useCardState();
  const { navigate } = useRouter();
  const { signInUrl, waitlistUrl } = useSignUpContext();
  const supportEmail = useSupportEmail();
  const { userSettings } = useEnvironment();
  const { mode } = userSettings.signUp;

  const handleEmailSupport = () => {
    window.location.href = `mailto:${supportEmail}`;
  };

  const handleWaitlistNavigate = async () => {
    await navigate(clerk.buildUrlWithAuth(waitlistUrl));
  };

  const subtitle =
    mode === SIGN_UP_MODES.RESTRICTED
      ? localizationKeys('signUp.restrictedAccess.subtitle')
      : localizationKeys('signUp.restrictedAccess.subtitleWaitlist');

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
          <Header.Subtitle localizationKey={subtitle} />
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>
        {mode === SIGN_UP_MODES.RESTRICTED && supportEmail && (
          <Flex
            direction='col'
            gap={4}
          >
            <Button
              localizationKey={localizationKeys('signUp.restrictedAccess.blockButton__emailSupport')}
              onClick={handleEmailSupport}
            />
          </Flex>
        )}
        {mode === SIGN_UP_MODES.WAITLIST && (
          <Flex
            direction='col'
            gap={4}
          >
            <Button
              localizationKey={localizationKeys('signUp.restrictedAccess.blockButton__joinWaitlist')}
              onClick={handleWaitlistNavigate}
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
