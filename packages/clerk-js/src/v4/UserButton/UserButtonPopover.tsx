import { ActiveSessionResource } from '@clerk/types';
import React from 'react';

import { useCoreSession, useCoreUser, useEnvironment, useOptions, useUserButtonContext } from '../../ui/contexts';
import { Flex, Flow, Link } from '../customizables';
import { EmptyCard, PoweredByClerkText } from '../elements';
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
  const paths = useOptions().paths || {};
  return (
    <Flex gap={4}>
      {paths.termsPageUrl && <UserButtonLink href={paths.termsPageUrl}>Terms</UserButtonLink>}
      {paths.privacyPageUrl && <UserButtonLink href={paths.privacyPageUrl}>Privacy</UserButtonLink>}
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

const UserButtonCard = React.forwardRef<HTMLDivElement, PropsOfComponent<typeof EmptyCard>>((props, ref) => {
  return (
    <Flow.Part part='popover'>
      <EmptyCard
        {...props}
        ref={ref}
        sx={theme => ({
          padding: `${theme.space.$6} 0`,
          minWidth: theme.sizes.$94,
          zIndex: theme.zIndices.$modal,
          animation: `${animations.dropdownFadeInAndScale} 140ms `,
        })}
      >
        {props.children}
      </EmptyCard>
    </Flow.Part>
  );
});
