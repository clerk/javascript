import { useUser } from '@clerk/shared/react';
import type { EmailAddressResource, UserResource } from '@clerk/types';
import { useEffect, useState } from 'react';

import { sortIdentificationBasedOnVerification } from '../../components/UserProfile/utils';
import { Badge, Flex, localizationKeys, Text } from '../../customizables';
import { ProfileSection, ThreeDotsMenu, useCardState } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import type { PropsOfComponent } from '../../styledSystem';
import { handleError } from '../../utils';
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
  const [actionRootValue, setActionRootValue] = useState<string | null>(null);
  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.emailAddressesSection.title')}
      centered={false}
      id='emailAddresses'
    >
      <Action.Root
        value={actionRootValue}
        onChange={setActionRootValue}
      >
        <ProfileSection.ItemList id='emailAddresses'>
          {sortIdentificationBasedOnVerification(user?.emailAddresses, user?.primaryEmailAddressId).map(email => (
            <EmailRow
              key={email.emailAddress}
              email={email}
              user={user}
              actionRootValue={actionRootValue}
              setActionRootValue={setActionRootValue}
            />
          ))}
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

const EmailRow = ({
  user,
  email,
  actionRootValue,
  setActionRootValue,
}: {
  user: UserResource | null | undefined;
  email: EmailAddressResource;
  actionRootValue?: string | null;
  setActionRootValue: (value: string | null) => void;
}) => {
  const [internalValue, setInternalValue] = useState<string | null>(null);

  useEffect(() => {
    if (actionRootValue === 'add') {
      setInternalValue(null);
    }
  }, [actionRootValue]);

  return (
    <Action.Root
      value={internalValue}
      onChange={setInternalValue}
    >
      <ProfileSection.Item id='emailAddresses'>
        <Flex sx={t => ({ overflow: 'hidden', gap: t.space.$1 })}>
          <Text
            sx={t => ({ color: t.colors.$colorText })}
            truncate
          >
            {email.emailAddress}
          </Text>
          {user?.primaryEmailAddressId === email.id && <Badge localizationKey={localizationKeys('badge__primary')} />}
          {email.verification.status !== 'verified' && (
            <Badge localizationKey={localizationKeys('badge__unverified')} />
          )}
        </Flex>
        <EmailMenu
          email={email}
          resetActionRootValue={() => {
            setActionRootValue(null);
          }}
        />
      </ProfileSection.Item>

      <Action.Open value='remove'>
        <Action.Card variant='destructive'>
          <RemoveEmailScreen emailId={email.id} />
        </Action.Card>
      </Action.Open>

      <Action.Open value='verify'>
        <Action.Card>
          <EmailScreen emailId={email.id} />
        </Action.Card>
      </Action.Open>
    </Action.Root>
  );
};

const EmailMenu = ({
  email,
  resetActionRootValue,
}: {
  email: EmailAddressResource;
  resetActionRootValue?: () => void;
}) => {
  const card = useCardState();
  const { user } = useUser();
  const { open } = useActionContext();
  const isPrimary = user?.primaryEmailAddressId === email.id;
  const isVerified = email.verification.status === 'verified';
  const setPrimary = () => {
    return user?.update({ primaryEmailAddressId: email.id }).catch(e => handleError(e, [], card.setError));
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
        onClick: () => {
          open('remove');
          resetActionRootValue?.();
        },
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};
