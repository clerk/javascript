import { OrganizationResource } from '@clerk/types';
import React from 'react';

import { useCoreUser, useEnvironment } from '../../contexts';
import { Flex, Flow, Link, localizationKeys, Text, useAppearance } from '../../customizables';
import { Action, BaseCard, OrganizationPreview, PersonalWorkspacePreview, PoweredByClerkText } from '../../elements';
import { RootBox } from '../../elements/RootBox';
import { CogFilled, Plus } from '../../icons';
import { animations, PropsOfComponent } from '../../styledSystem';
import {
  OrganizationActions,
  OrganizationPreviewButton,
  PersonalWorkspacePreviewButton,
} from './OtherOrganizationActions';

type OrganizationSwitcherPopoverProps = { isOpen: boolean; close: () => void } & PropsOfComponent<
  typeof OrganizationSwitcherCard
>;

export const OrganizationSwitcherPopover = React.forwardRef<HTMLDivElement, OrganizationSwitcherPopoverProps>(
  (props, ref) => {
    const { isOpen, close, ...rest } = props;
    const { authConfig } = useEnvironment();
    // const organization = useCoreOrganization();
    const user = useCoreUser();

    /* Mocks */
    const organization = { name: 'Test Org', logoUrl: user.profileImageUrl } as OrganizationResource;
    const hidePersonal = false;
    const otherOrganizations = [
      { name: 'Test Org2', logoUrl: user.profileImageUrl },
      { name: 'Test Org3', logoUrl: user.profileImageUrl },
      { name: 'Test Org4', logoUrl: user.profileImageUrl },
    ] as OrganizationResource[];
    const handleOrganizationClicked = (_organization: OrganizationResource) => () => {
      close();
    };
    const handleCreateOrganizationClicked = () => {
      close();
    };
    const handleManageOrganizationClicked = () => {
      close();
    };
    const handlePersonalWorkspaceClicked = () => {
      close();
    };

    if (!isOpen) {
      return null;
    }

    const manageOrganizationButton = (
      <Action
        // elementDescriptor={descriptors.organizationSwitcherPopoverActionButton}
        // elementId={descriptors.organizationSwitcherPopoverActionButton.setId('manageOrganization')}
        // iconBoxElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIconBox}
        // iconBoxElementId={descriptors.organizationSwitcherPopoverActionButtonIconBox.setId('manageOrganization')}
        // iconElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIcon}
        // iconElementId={descriptors.organizationSwitcherPopoverActionButtonIcon.setId('manageOrganization')}
        // textElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonText}
        // textElementId={descriptors.organizationSwitcherPopoverActionButtonText.setId('manageOrganization')}
        icon={CogFilled}
        label={localizationKeys('organizationSwitcher.action__manageOrganization')}
        onClick={handleManageOrganizationClicked}
        sx={t => ({ margin: `${t.space.$2} 0` })}
      />
    );

    const createOrganizationButton = (
      <Action
        // elementDescriptor={descriptors.organizationSwitcherPopoverActionButton}
        //   elementId={descriptors.organizationSwitcherPopoverActionButton.setId('createOrganization')}
        //   iconBoxElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIconBox}
        //   iconBoxElementId={descriptors.organizationSwitcherPopoverActionButtonIconBox.setId('createOrganization')}
        //   iconElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonIcon}
        //   iconElementId={descriptors.organizationSwitcherPopoverActionButtonIcon.setId('createOrganization')}
        //   textElementDescriptor={descriptors.organizationSwitcherPopoverActionButtonText}
        //   textElementId={descriptors.organizationSwitcherPopoverActionButtonText.setId('createOrganization')}
        icon={Plus}
        label={localizationKeys('organizationSwitcher.action__createOrganization')}
        onClick={handleCreateOrganizationClicked}
      />
    );

    const organizationActions = authConfig.singleSessionMode ? null : otherOrganizations.length > 0 ? (
      <>
        <OrganizationActions>
          {organization && !hidePersonal && (
            <PersonalWorkspacePreviewButton
              // elementDescriptor={descriptors.organizationSwitcherPersonalWorkspace}
              // elementId={'organizationSwitcher' as any}
              user={user}
              sx={t => ({
                marginBottom: t.space.$4,
              })}
              onClick={handlePersonalWorkspaceClicked}
            />
          )}
          <Text
            // elementDescriptor={descriptors.organizationSwitcherTitle}
            size='xss'
            colorScheme='neutral'
            sx={t => ({
              paddingLeft: t.space.$6,
              marginBottom: t.space.$1,
              textTransform: 'uppercase',
            })}
            localizationKey={localizationKeys('organizationSwitcher.title')}
          />
          {otherOrganizations.map(organization => (
            <OrganizationPreviewButton
              key={organization.id}
              organization={organization}
              onClick={handleOrganizationClicked(organization)}
            />
          ))}
          {createOrganizationButton}
        </OrganizationActions>
      </>
    ) : (
      <OrganizationActions>{createOrganizationButton}</OrganizationActions>
    );

    return (
      <RootBox
      // elementDescriptor={descriptors.organizationSwitcherPopoverRootBox}
      >
        <OrganizationSwitcherCard
          ref={ref}
          {...rest}
        >
          <Main>
            {organization ? (
              <>
                <OrganizationPreview
                  //   elementId={'organizationSwitcher' as any}
                  organization={organization}
                  sx={theme => ({ padding: `0 ${theme.space.$6}` })}
                />
                {manageOrganizationButton}
              </>
            ) : (
              !hidePersonal && (
                <PersonalWorkspacePreview
                  //   elementId={'organizationSwitcher' as any}
                  user={user}
                  sx={theme => ({ padding: `0 ${theme.space.$6}`, marginBottom: theme.space.$6 })}
                />
              )
            )}
            {organizationActions}
          </Main>
          <Footer />
        </OrganizationSwitcherCard>
      </RootBox>
    );
  },
);

const Main = (props: React.PropsWithChildren<Record<never, never>>) => {
  return (
    <Flex
      //   elementDescriptor={descriptors.organizationSwitcherPopoverMain}
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
      //   elementDescriptor={descriptors.organizationSwitcherPopoverFooter}
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
      //   elementDescriptor={descriptors.organizationSwitcherPopoverFooterPages}
      gap={4}
    >
      {termsPageUrl && (
        <OrganizationSwitcherLink
          localizationKey={localizationKeys('footerPageLink__terms')}
          //   elementDescriptor={descriptors.organizationSwitcherPopoverFooterPagesLink}
          //   elementId={descriptors.organizationSwitcherPopoverFooterPagesLink.setId('terms')}
          href={termsPageUrl}
        />
      )}
      {privacyPageUrl && (
        <OrganizationSwitcherLink
          localizationKey={localizationKeys('footerPageLink__privacy')}
          //   elementDescriptor={descriptors.organizationSwitcherPopoverFooterPagesLink}
          //   elementId={descriptors.organizationSwitcherPopoverFooterPagesLink.setId('privacy')}
          href={privacyPageUrl}
        />
      )}
    </Flex>
  );
};

const OrganizationSwitcherLink = (props: PropsOfComponent<typeof Link>) => {
  return (
    <Link
      colorScheme='neutral'
      isExternal
      size='xss'
      {...props}
    />
  );
};

const OrganizationSwitcherCard = React.forwardRef<HTMLDivElement, PropsOfComponent<typeof BaseCard>>((props, ref) => {
  return (
    <Flow.Part part='popover'>
      <BaseCard
        // elementDescriptor={descriptors.organizationSwitcherPopoverCard}
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
