import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';

import { Button, Flex, Icon, localizationKeys } from '../../customizables';
import { Block } from '../../icons';
import type { useSignUpRestrictedAccessController } from './sign-up-restricted-access.controller';

export const SignUpRestrictedAccessView = ({
  isRestricted,
  isWaitlist,
  supportEmail,
  signInHref,
  error,
  onEmailSupport,
  onWaitlistNavigate,
}: ReturnType<typeof useSignUpRestrictedAccessController>): JSX.Element => {
  const subtitle = isRestricted
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
        <Card.Alert>{error}</Card.Alert>
        {isRestricted && supportEmail && (
          <Flex
            direction='col'
            gap={4}
          >
            <Button
              localizationKey={localizationKeys('signUp.restrictedAccess.blockButton__emailSupport')}
              onClick={onEmailSupport}
            />
          </Flex>
        )}
        {isWaitlist && (
          <Flex
            direction='col'
            gap={4}
          >
            <Button
              localizationKey={localizationKeys('signUp.restrictedAccess.blockButton__joinWaitlist')}
              onClick={onWaitlistNavigate}
            />
          </Flex>
        )}
      </Card.Content>
      <Card.Footer>
        <Card.Action elementId='signUp'>
          <Card.ActionText localizationKey={localizationKeys('signUp.restrictedAccess.actionText')} />
          <Card.ActionLink
            localizationKey={localizationKeys('signUp.restrictedAccess.actionLink')}
            to={signInHref}
          />
        </Card.Action>
      </Card.Footer>
    </Card.Root>
  );
};
