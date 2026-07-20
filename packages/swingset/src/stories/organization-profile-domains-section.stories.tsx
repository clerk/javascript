/** @jsxImportSource @emotion/react */
import type { OrganizationDomainResource } from '@clerk/shared/types';
import { useMachine } from '@clerk/ui/mosaic/machine/useMachine';
import type { OrganizationProfileEnrollmentOption } from '@clerk/ui/mosaic/organization/organization-profile-domains-section.controller';
import { OrganizationProfileDomainsSectionView } from '@clerk/ui/mosaic/organization/organization-profile-domains-section.view';
import { organizationProfileDomainsSectionAddVerifyMachine } from '@clerk/ui/mosaic/organization/organization-profile-domains-section-add-verify.machine';
import { organizationProfileDomainsSectionEnrollmentMachine } from '@clerk/ui/mosaic/organization/organization-profile-domains-section-enrollment.machine';
import { organizationProfileDomainsSectionRemoveMachine } from '@clerk/ui/mosaic/organization/organization-profile-domains-section-remove.machine';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationProfileDomainsSection',
  source: 'packages/ui/src/mosaic/organization/organization-profile-domains-section.tsx',
};

// Demo async deps: resolve after a short delay so the loading/saving states are visible.
const delay = () => new Promise<void>(resolve => setTimeout(resolve, 600));

const ENROLLMENT_OPTIONS: OrganizationProfileEnrollmentOption[] = [
  {
    value: 'manual_invitation',
    label: 'No automatic enrollment',
    description: 'Users can only be invited manually to the organization.',
  },
  {
    value: 'automatic_invitation',
    label: 'Automatic invitations',
    description: 'Users are automatically invited to join the organization when they sign up and can join anytime.',
  },
  {
    value: 'automatic_suggestion',
    label: 'Automatic suggestions',
    description: 'Users receive a suggestion to request to join, but must be approved by an admin.',
  },
];

// The view reads only id/name/verification/enrollmentMode/pending counts, so a partial fixture
// is enough. The cast is confined to these swingset demo fixtures.
const demoDomains = [
  {
    id: 'dmn_1',
    name: 'acme.com',
    enrollmentMode: 'automatic_invitation',
    verification: { status: 'verified' },
    totalPendingInvitations: 3,
    totalPendingSuggestions: 1,
  },
  {
    id: 'dmn_2',
    name: 'acme.dev',
    enrollmentMode: 'manual_invitation',
    verification: { status: 'unverified' },
    totalPendingInvitations: 0,
    totalPendingSuggestions: 0,
  },
] as unknown as OrganizationDomainResource[];

export function Default() {
  const [addVerifySnapshot, sendAddVerify] = useMachine(organizationProfileDomainsSectionAddVerifyMachine, {
    context: {
      createDomain: async (name: string) => {
        await delay();
        return { id: 'dmn_new', name, verified: false };
      },
      prepareVerification: async () => {
        await delay();
      },
      attemptVerification: async () => {
        await delay();
        return { verified: true };
      },
      updateEnrollmentMode: async () => {
        await delay();
      },
    },
  });

  const [enrollmentSnapshot, sendEnrollment, enrollmentActor] = useMachine(
    organizationProfileDomainsSectionEnrollmentMachine,
    {
      context: {
        updateEnrollmentMode: async () => {
          await delay();
        },
      },
    },
  );

  const [removeSnapshot, sendRemove] = useMachine(organizationProfileDomainsSectionRemoveMachine, {
    context: {
      deleteDomain: async () => {
        await delay();
      },
    },
  });

  return (
    <OrganizationProfileDomainsSectionView
      canManage
      list={{ data: demoDomains, isLoading: false, hasNextPage: false, fetchNext: () => {} }}
      enrollmentOptions={ENROLLMENT_OPTIONS}
      addVerify={{ snapshot: addVerifySnapshot, send: sendAddVerify }}
      enrollment={{
        snapshot: enrollmentSnapshot,
        send: sendEnrollment,
        canSubmit: enrollmentActor.can({ type: 'SUBMIT' }),
      }}
      remove={{ snapshot: removeSnapshot, send: sendRemove }}
    />
  );
}
