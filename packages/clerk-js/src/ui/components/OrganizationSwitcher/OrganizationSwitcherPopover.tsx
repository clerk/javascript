import { OrganizationResource } from '@clerk/types';
import React from 'react';

import {
  useCoreClerk,
  useCoreOrganization,
  useCoreOrganizationList,
  useCoreUser,
  useEnvironment,
} from '../../contexts';
import { Flex, Flow, Link, localizationKeys, useAppearance } from '../../customizables';
import {
  Action,
  BaseCard,
  OrganizationPreview,
  PersonalWorkspacePreview,
  PoweredByClerkText,
  useCardState,
} from '../../elements';
import { RootBox } from '../../elements/RootBox';
import { CogFilled } from '../../icons';
import { animations, PropsOfComponent } from '../../styledSystem';
import { OrganizationActionList } from './OtherOrganizationActions';

type OrganizationSwitcherPopoverProps = { isOpen: boolean; close: () => void } & PropsOfComponent<
  typeof OrganizationSwitcherCard
>;

export const OrganizationSwitcherPopover = React.forwardRef<HTMLDivElement, OrganizationSwitcherPopoverProps>(
  (props, ref) => {
    const { isOpen, close, ...rest } = props;
    const card = useCardState();
    const { openOrganizationProfile } = useCoreClerk();
    const { organization: currentOrg } = useCoreOrganization();
    const { createOrganization, isLoaded, setActive } = useCoreOrganizationList();
    const user = useCoreUser();

    if (!isLoaded) {
      return null;
    }

    const showPersonalAccount = true;

    const handleOrganizationClicked = (organization: OrganizationResource) => {
      return card.runAsync(() => setActive({ organization })).then(close);
    };

    const handlePersonalWorkspaceClicked = () => {
      return card.runAsync(() => setActive({ organization: null })).then(close);
    };

    const handleCreateOrganizationClicked = () => {
      return card.runAsync(() => createOrganization({ name: `Org${Date.now()}` })).then(close);
    };

    const handleManageOrganizationClicked = () => {
      openOrganizationProfile();
      close();
    };

    if (!isOpen) {
      return null;
    }

    const manageOrganizationButton = (
      <Action
        icon={CogFilled}
        label={localizationKeys('organizationSwitcher.action__manageOrganization')}
        onClick={handleManageOrganizationClicked}
        sx={t => ({ margin: `${t.space.$2} 0` })}
      />
    );

    return (
      <RootBox>
        <OrganizationSwitcherCard
          ref={ref}
          {...rest}
        >
          <Main>
            {currentOrg ? (
              <>
                <OrganizationPreview
                  organization={currentOrg}
                  user={user}
                  sx={theme => ({ padding: `0 ${theme.space.$6}` })}
                />
                {manageOrganizationButton}
              </>
            ) : (
              showPersonalAccount && (
                <PersonalWorkspacePreview
                  user={user}
                  sx={theme => ({ padding: `0 ${theme.space.$6}`, marginBottom: theme.space.$6 })}
                />
              )
            )}
            <OrganizationActionList
              onCreateOrganizationClick={handleCreateOrganizationClicked}
              onPersonalWorkspaceClick={handlePersonalWorkspaceClicked}
              onOrganizationClick={handleOrganizationClicked}
            />
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
