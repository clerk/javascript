import { ActiveSessionResource } from '@clerk/types';
import React from 'react';

import { useCoreSession, useCoreUser, useEnvironment, useUserButtonContext } from '../../ui/contexts';
import { Card, Flex, Link } from '../customizables';
import { FlowCard, PoweredByClerkText } from '../elements';
import { CogFilled, Plus, SignOut, SignOutDouble } from '../icons';
import { animations, PropsOfComponent } from '../styledSystem';
import { Action, Actions } from './CurrentAccountActions';
import { SessionActions, UserPreviewButton } from './OtherSessionActions';
import { useMultisessionActions } from './useMultisessionActions';
import { UserPreview } from './UserPreview';

type UserButtonPopoverProps = { isOpen: boolean; close: () => void } & PropsOfComponent<typeof UserButtonCard>;

export const UserButtonPopover = React.forwardRef<HTMLDivElement, UserButtonPopoverProps>((props, ref) => {
  const { isOpen, close, ...rest } = props;
  const user = useCoreUser();
  const session = useCoreSession() as ActiveSessionResource;
  const { authConfig } = useEnvironment();
  const {
    handleAddAccountClicked,
    handleManageAccountClicked,
    handleSessionClicked,
    handleSignOutAllClicked,
    handleSignOutSessionClicked,
    otherSessions,
  } = useMultisessionActions({ ...useUserButtonContext(), actionCompleteCallback: close });

  if (!isOpen) {
    return null;
  }

  const addAccountButton = (
    <Action
      icon={Plus}
      label='Add account'
      onClick={handleAddAccountClicked}
    />
  );

  const sessionActions = authConfig.singleSessionMode ? null : otherSessions.length > 0 ? (
    <>
      <SessionActions>
        {otherSessions.map(session => (
          <UserPreviewButton
            key={session.id}
            user={session.user}
            onClick={handleSessionClicked(session)}
          />
        ))}
        {addAccountButton}
      </SessionActions>
      <Actions>
        <Action
          icon={SignOutDouble}
          label='Sign out of all accounts'
          onClick={handleSignOutAllClicked}
        />
      </Actions>
    </>
  ) : (
    <SessionActions>{addAccountButton}</SessionActions>
  );

  return (
    <UserButtonCard
      ref={ref}
      {...rest}
    >
      <Main>
        <UserPreview
          user={user}
          sx={theme => ({ padding: `0 ${theme.space.$6}`, marginBottom: theme.space.$2 })}
        />
        <Actions>
          <Action
            icon={CogFilled}
            label='Manage account'
            onClick={handleManageAccountClicked}
          />
          <Action
            icon={SignOut}
            label='Sign out'
            onClick={handleSignOutSessionClicked(session)}
          />
        </Actions>
        {sessionActions}
      </Main>
      <Footer />
    </UserButtonCard>
  );
});

const Main = (props: React.PropsWithChildren<{}>) => {
  return <Flex direction='col'>{props.children}</Flex>;
};

const Footer = () => {
  return (
    <Flex
      justify='between'
      sx={theme => ({
        padding: `${theme.space.$6}`,
        paddingBottom: 0,
        borderTop: `${theme.borders.$normal} ${theme.colors.$blackAlpha200}`,
      })}
    >
      <PoweredByClerkText />
      <Links />
    </Flex>
  );
};

const Links = () => {
  return (
    <Flex gap={4}>
      <UserButtonLink href='https://www.google.com'>Terms</UserButtonLink>
      <UserButtonLink href='https://www.google.com'>Privacy</UserButtonLink>
    </Flex>
  );
};

const UserButtonLink = (props: PropsOfComponent<typeof Link>) => {
  return (
    <Link
      colorScheme='neutral'
      isExternal
      size='xss'
      {...props}
    />
  );
};

const UserButtonCard = React.forwardRef<HTMLDivElement, PropsOfComponent<typeof Card>>((props, ref) => {
  return (
    <FlowCard.OuterContainer
      {...props}
      ref={ref}
    >
      <FlowCard.Content
        logoMarkTag={false}
        sx={theme => ({
          padding: `${theme.space.$6} 0`,
          minWidth: theme.sizes.$94,
          zIndex: theme.zIndices.$modal,
          animation: `${animations.dropdownFadeInAndScale} 140ms `,
        })}
      >
        {props.children}
      </FlowCard.Content>
    </FlowCard.OuterContainer>
  );
});
