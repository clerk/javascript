import { ActiveSessionResource } from '@clerk/types';
import React from 'react';

import { useCoreSession, useCoreUser, useEnvironment, useUserButtonContext } from '../../contexts';
import { descriptors, Flex, Flow, Link, localizationKeys, useAppearance } from '../../customizables';
import { BaseCard, PoweredByClerkText, UserPreview } from '../../elements';
import { RootBox } from '../../elements/RootBox';
import { CogFilled, Plus, SignOut, SignOutDouble } from '../../icons';
import { animations, PropsOfComponent } from '../../styledSystem';
import { Action, Actions } from './CurrentAccountActions';
import { SessionActions, UserPreviewButton } from './OtherSessionActions';
import { useMultisessionActions } from './useMultisessionActions';

type UserButtonPopoverProps = { isOpen: boolean; close: () => void } & PropsOfComponent<typeof UserButtonCard>;

export const UserButtonPopover = React.forwardRef<HTMLDivElement, UserButtonPopoverProps>((props, ref) => {
  const { isOpen, close, ...rest } = props;
  const session = useCoreSession() as ActiveSessionResource;
  const { authConfig } = useEnvironment();
  const user = useCoreUser();
  const {
    handleAddAccountClicked,
    handleManageAccountClicked,
    handleSessionClicked,
    handleSignOutAllClicked,
    handleSignOutSessionClicked,
    otherSessions,
  } = useMultisessionActions({ ...useUserButtonContext(), actionCompleteCallback: close, user });

  if (!isOpen) {
    return null;
  }

  const addAccountButton = (
    <Action
      icon={Plus}
      label={localizationKeys('userButton.action__addAccount')}
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
          label={localizationKeys('userButton.action__signOutAll')}
          onClick={handleSignOutAllClicked}
        />
      </Actions>
    </>
  ) : (
    <SessionActions>{addAccountButton}</SessionActions>
  );

  return (
    <RootBox elementDescriptor={descriptors.userButtonPopoverRootBox}>
      <UserButtonCard
        ref={ref}
        {...rest}
      >
        <Main>
          <UserPreview
            elementId={'userButton' as any}
            user={user}
            sx={theme => ({ padding: `0 ${theme.space.$6}`, marginBottom: theme.space.$2 })}
          />
          <Actions elementDescriptor={descriptors.userButtonPopoverActions}>
            <Action
              elementDescriptor={descriptors.userButtonPopoverActionButton}
              elementId={descriptors.userButtonPopoverActionButton.setId('manageAccount')}
              iconBoxElementDescriptor={descriptors.userButtonPopoverActionButtonIconBox}
              iconBoxElementId={descriptors.userButtonPopoverActionButtonIconBox.setId('manageAccount')}
              iconElementDescriptor={descriptors.userButtonPopoverActionButtonIcon}
              iconElementId={descriptors.userButtonPopoverActionButtonIcon.setId('manageAccount')}
              textElementDescriptor={descriptors.userButtonPopoverActionButtonText}
              textElementId={descriptors.userButtonPopoverActionButtonText.setId('manageAccount')}
              icon={CogFilled}
              label={localizationKeys('userButton.action__manageAccount')}
              onClick={handleManageAccountClicked}
            />
            <Action
              elementDescriptor={descriptors.userButtonPopoverActionButton}
              elementId={descriptors.userButtonPopoverActionButton.setId('signOut')}
              iconBoxElementDescriptor={descriptors.userButtonPopoverActionButtonIconBox}
              iconBoxElementId={descriptors.userButtonPopoverActionButtonIconBox.setId('signOut')}
              iconElementDescriptor={descriptors.userButtonPopoverActionButtonIcon}
              iconElementId={descriptors.userButtonPopoverActionButtonIcon.setId('signOut')}
              textElementDescriptor={descriptors.userButtonPopoverActionButtonText}
              textElementId={descriptors.userButtonPopoverActionButtonText.setId('signOut')}
              icon={SignOut}
              label={localizationKeys('userButton.action__signOut')}
              onClick={handleSignOutSessionClicked(session)}
            />
          </Actions>
          {sessionActions}
        </Main>
        <Footer />
      </UserButtonCard>
    </RootBox>
  );
});

const Main = (props: React.PropsWithChildren<{}>) => {
  return (
    <Flex
      elementDescriptor={descriptors.userButtonPopoverMain}
      direction='col'
    >
      {props.children}
    </Flex>
  );
};

const Footer = () => {
  const { branded } = useEnvironment().displayConfig;
  const { privacyPageUrl, termsPageUrl } = useAppearance().parsedLayout;
  const shouldShow = branded || privacyPageUrl || termsPageUrl;

  if (!shouldShow) {
    return null;
  }

  return (
    <Flex
      elementDescriptor={descriptors.userButtonPopoverFooter}
      justify='between'
      sx={theme => ({
        padding: `${theme.space.$6}`,
        paddingBottom: 0,
        borderTop: `${theme.borders.$normal} ${theme.colors.$blackAlpha200}`,
        '&:empty': {
          padding: '0',
        },
      })}
    >
      <PoweredByClerkText />
      <Links />
    </Flex>
  );
};

const Links = () => {
  const { privacyPageUrl, termsPageUrl } = useAppearance().parsedLayout;

  if (!termsPageUrl && !privacyPageUrl) {
    return null;
  }

  return (
    <Flex
      elementDescriptor={descriptors.userButtonPopoverFooterPages}
      gap={4}
    >
      {termsPageUrl && (
        <UserButtonLink
          localizationKey={localizationKeys('footerPageLink__terms')}
          elementDescriptor={descriptors.userButtonPopoverFooterPagesLink}
          elementId={descriptors.userButtonPopoverFooterPagesLink.setId('terms')}
          href={termsPageUrl}
        />
      )}
      {privacyPageUrl && (
        <UserButtonLink
          localizationKey={localizationKeys('footerPageLink__privacy')}
          elementDescriptor={descriptors.userButtonPopoverFooterPagesLink}
          elementId={descriptors.userButtonPopoverFooterPagesLink.setId('privacy')}
          href={privacyPageUrl}
        />
      )}
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

const UserButtonCard = React.forwardRef<HTMLDivElement, PropsOfComponent<typeof BaseCard>>((props, ref) => {
  return (
    <Flow.Part part='popover'>
      <BaseCard
        elementDescriptor={descriptors.userButtonPopoverCard}
        {...props}
        ref={ref}
        sx={t => ({
          padding: `${t.space.$6} 0`,
          width: t.sizes.$94,
          maxWidth: `calc(100vw - ${t.sizes.$8})`,
          zIndex: t.zIndices.$modal,
          animation: `${animations.dropdownSlideInScaleAndFade} 140ms `,
        })}
      >
        {props.children}
      </BaseCard>
    </Flow.Part>
  );
});
