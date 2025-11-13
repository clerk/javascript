import { useReverification, useUser } from '@clerk/shared/react';
import type { EmailAddressResource } from '@clerk/shared/types';
import { Fragment } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { handleError } from '@/ui/utils/errorHandler';

import { sortIdentificationBasedOnVerification } from '../../components/UserProfile/utils';
import { Badge, Flex, localizationKeys, Text } from '../../customizables';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import type { PropsOfComponent } from '../../styledSystem';
import { EmailForm } from './EmailForm';
import { RemoveEmailForm } from './RemoveResourceForm';

type RemoveEmailScreenProps = { emailId: string };
const RemoveEmailScreen = (props: RemoveEmailScreenProps) => {
  const { close } = useActionContext();
  return (
    <RemoveEmailForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};

type EmailScreenProps = { emailId?: string };
const EmailScreen = (props: EmailScreenProps) => {
  const { close } = useActionContext();
  return (
    <EmailForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};

export const EmailsSection = ({ shouldAllowCreation = true }) => {
  const { user } = useUser();

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.emailAddressesSection.title')}
      centered={false}
      id='emailAddresses'
    >
      <Action.Root>
        <ProfileSection.ItemList id='emailAddresses'>
          {sortIdentificationBasedOnVerification(user?.emailAddresses, user?.primaryEmailAddressId).map(email => {
            const emailId = email.id;
            return (
              <Fragment key={email.emailAddress}>
                <ProfileSection.Item id='emailAddresses'>
                  <Flex sx={t => ({ overflow: 'hidden', gap: t.space.$1 })}>
                    <Text
                      sx={t => ({ color: t.colors.$colorForeground })}
                      truncate
                    >
                      {email.emailAddress}
                    </Text>
                    {user?.primaryEmailAddressId === emailId && (
                      <Badge localizationKey={localizationKeys('badge__primary')} />
                    )}
                    {email.verification.status !== 'verified' && (
                      <Badge localizationKey={localizationKeys('badge__unverified')} />
                    )}
                  </Flex>
                  <EmailMenu email={email} />
                </ProfileSection.Item>

                <Action.Open value={`remove-${emailId}`}>
                  <Action.Card variant='destructive'>
                    <RemoveEmailScreen emailId={emailId} />
                  </Action.Card>
                </Action.Open>

                <Action.Open value={`verify-${emailId}`}>
                  <Action.Card>
                    <EmailScreen emailId={emailId} />
                  </Action.Card>
                </Action.Open>
              </Fragment>
            );
          })}
          {shouldAllowCreation && (
            <>
              <Action.Trigger value='add'>
                <ProfileSection.ArrowButton
                  id='emailAddresses'
                  localizationKey={localizationKeys('userProfile.start.emailAddressesSection.primaryButton')}
                />
              </Action.Trigger>
              <Action.Open value='add'>
                <Action.Card>
                  <EmailScreen />
                </Action.Card>
              </Action.Open>
            </>
          )}
        </ProfileSection.ItemList>
      </Action.Root>
    </ProfileSection.Root>
  );
};

const EmailMenu = ({ email }: { email: EmailAddressResource }) => {
  const card = useCardState();
  const { user } = useUser();
  const { open } = useActionContext();
  const emailId = email.id;
  const isPrimary = user?.primaryEmailAddressId === emailId;
  const isVerified = email.verification.status === 'verified';
  const setPrimary = useReverification(() => {
    return user?.update({ primaryEmailAddressId: emailId });
  });

  const actions = (
    [
      isPrimary && !isVerified
        ? {
            label: localizationKeys('userProfile.start.emailAddressesSection.detailsAction__primary'),
            onClick: () => open(`verify-${emailId}`),
          }
        : null,
      !isPrimary && isVerified
        ? {
            label: localizationKeys('userProfile.start.emailAddressesSection.detailsAction__nonPrimary'),
            onClick: () => {
              setPrimary().catch(e => handleError(e, [], card.setError));
            },
          }
        : null,
      !isPrimary && !isVerified
        ? {
            label: localizationKeys('userProfile.start.emailAddressesSection.detailsAction__unverified'),
            onClick: () => open(`verify-${emailId}`),
          }
        : null,
      {
        label: localizationKeys('userProfile.start.emailAddressesSection.destructiveAction'),
        isDestructive: true,
        onClick: () => open(`remove-${emailId}`),
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};
