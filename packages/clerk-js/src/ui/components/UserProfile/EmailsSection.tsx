import { useUser } from '@clerk/shared/react';
import type { EmailAddressResource } from '@clerk/types';

import { Badge, Button, Col, Flex, localizationKeys, Text } from '../../customizables';
import { ProfileSection, ThreeDotsMenu, useCardState } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import type { PropsOfComponent } from '../../styledSystem';
import { handleError } from '../../utils';
import { EmailForm } from './EmailForm';
import { RemoveEmailForm } from './RemoveResourcePage';
import { primaryIdentificationFirst } from './utils';

export const EmailsSection = () => {
  const { user } = useUser();

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.emailAddressesSection.title')}
      id='emailAddresses'
    >
      <Action.Root>
        <Col sx={t => ({ gap: t.space.$1 })}>
          {user?.emailAddresses.sort(primaryIdentificationFirst(user.primaryEmailAddressId)).map(email => (
            <Action.Root key={email.emailAddress}>
              <Action.Closed value=''>
                <Flex sx={t => ({ justifyContent: 'space-between', padding: `${t.space.$0x5} ${t.space.$4}` })}>
                  <Text>
                    {email.emailAddress}{' '}
                    {user?.primaryEmailAddressId === email.id && (
                      <Badge localizationKey={localizationKeys('badge__primary')} />
                    )}
                    {email.verification.status !== 'verified' && (
                      <Badge localizationKey={localizationKeys('badge__unverified')} />
                    )}
                  </Text>

                  <EmailMenu email={email} />
                </Flex>
              </Action.Closed>

              <Action.Open value='remove'>
                <Action.Card>
                  <RemoveEmailForm emailId={email.id} />
                </Action.Card>
              </Action.Open>

              <Action.Open value='verify'>
                <Action.Card>
                  <EmailForm emailId={email.id} />
                </Action.Card>
              </Action.Open>
            </Action.Root>
          ))}

          <Action.Trigger value='add'>
            <Button
              id='emailAddresses'
              variant='ghost'
              sx={t => ({ justifyContent: 'start', padding: `${t.space.$1} ${t.space.$4}` })}
              localizationKey={localizationKeys('userProfile.start.emailAddressesSection.primaryButton')}
            />
          </Action.Trigger>
        </Col>

        <Action.Open value='add'>
          <Action.Card>
            <EmailForm />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection>
  );
};

const EmailMenu = ({ email }: { email: EmailAddressResource }) => {
  const card = useCardState();
  const { user } = useUser();
  const { open } = useActionContext();
  const isPrimary = user?.primaryEmailAddressId === email.id;
  const isVerified = email.verification.status === 'verified';
  const setPrimary = () => {
    return user!.update({ primaryEmailAddressId: email.id }).catch(e => handleError(e, [], card.setError));
  };

  const actions = (
    [
      isPrimary && !isVerified
        ? {
            label: localizationKeys('userProfile.start.emailAddressesSection.detailsAction__primary'),
            onClick: () => open('verify'),
          }
        : null,
      !isPrimary && isVerified
        ? {
            label: localizationKeys('userProfile.start.emailAddressesSection.detailsAction__nonPrimary'),
            onClick: setPrimary,
          }
        : null,
      !isPrimary && !isVerified
        ? {
            label: localizationKeys('userProfile.start.emailAddressesSection.detailsAction__unverified'),
            onClick: () => open('verify'),
          }
        : null,
      {
        label: localizationKeys('userProfile.start.emailAddressesSection.destructiveAction'),
        isDestructive: true,
        onClick: () => open('remove'),
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};
