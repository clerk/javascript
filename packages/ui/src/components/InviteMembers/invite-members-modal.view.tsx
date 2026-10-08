import type { ComponentType, PropsWithChildren, ReactNode } from 'react';

import { Wizard } from '@/common';
import { SubscriberTypeContext } from '@/contexts';
import { localizationKeys } from '@/customizables';
import { Card } from '@/elements/Card';
import { FormContainer } from '@/elements/FormContainer';
import { Route } from '@/router';

import type { useInviteMembersWizardController } from '../OrganizationProfile/invite-members-wizard.controller';

export const InviteMembersModalInnerView = ({
  controller,
  form,
  successMessage,
}: {
  controller: ReturnType<typeof useInviteMembersWizardController>;
  form: ReactNode;
  successMessage: ReactNode;
}) => (
  <Card.Root>
    <Card.Content>
      <Wizard {...controller.wizardProps}>
        <FormContainer
          headerTitle={localizationKeys('organizationProfile.invitePage.title')}
          headerTitleTextVariant='h2'
          headerSubtitle={localizationKeys('organizationProfile.invitePage.subtitle')}
        >
          {form}
        </FormContainer>
        <FormContainer
          headerTitle={localizationKeys('organizationProfile.invitePage.title')}
          headerTitleTextVariant='h2'
        >
          {successMessage}
        </FormContainer>
      </Wizard>
    </Card.Content>
    <Card.Footer />
  </Card.Root>
);

export const InviteMembersModalView = ({
  Guard,
  content,
}: {
  Guard: ComponentType<PropsWithChildren>;
  content: ReactNode;
}) => (
  <Route path='inviteMembers'>
    <SubscriberTypeContext.Provider value='organization'>
      <Guard>
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>{content}</div>
      </Guard>
    </SubscriberTypeContext.Provider>
  </Route>
);
