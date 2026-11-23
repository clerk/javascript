'use client';

import type { ReactElement, ReactNode } from 'react';

import { useCreateOrganizationFlow } from '../create-organization/create-organization';
import type { CreateOrganizationReadyModel } from '../create-organization/create-organization.controller';
import { CreateOrganizationSteps } from '../create-organization/create-organization.view';
import type { OrganizationListReadyController } from './organization-list.controller';
import { useOrganizationListController, useOrganizationListScreenController } from './organization-list.controller';
import type { OrganizationListModelOptions } from './organization-list.model';
import { useOrganizationListModel } from './organization-list.model';
import { OrganizationListSkeleton } from './organization-list.skeleton';
import { OrganizationListView } from './organization-list.view';

/** Everything `<OrganizationList />` takes: where selecting or creating an organization lands, whether to list the personal account, and whether creating offers invitations. */
export type OrganizationListProps = OrganizationListModelOptions & {
  /**
   * Rendered while Clerk loads. Nothing renders once Clerk answers that nobody is signed in.
   */
  fallback?: ReactNode;
};

/**
 * A card listing the accounts the signed-in user can continue as: their personal account, the
 * organizations they belong to, and the organizations they are invited to or may request to join.
 * Selecting one makes it active. Where the user may create organizations, a button opens the
 * create-organization flow in place of the list. It renders `fallback` until Clerk answers, and
 * nothing at all when nobody is signed in.
 *
 * @example
 * ```tsx
 * <OrganizationList />
 * ```
 *
 * @example
 * `afterSelectOrganizationUrl` and `afterSelectPersonalUrl` are where selecting lands, and take a
 * `:param` template, a plain path, or a function. `hidePersonal` leaves the personal account out.
 * ```tsx
 * <OrganizationList
 *   hidePersonal
 *   afterSelectOrganizationUrl='/orgs/:slug'
 *   afterCreateOrganizationUrl='/orgs/:slug'
 * />
 * ```
 */
export function OrganizationList({ fallback, ...options }: OrganizationListProps = {}): ReactElement | null {
  const model = useOrganizationListModel(options);
  const controller = useOrganizationListController(model);

  if (controller.status === 'loading') {
    return <>{fallback}</>;
  }

  if (controller.status === 'hidden') {
    return null;
  }

  if (controller.organizationsLoading) {
    return (
      <OrganizationListSkeleton
        hidePersonal={controller.hidePersonal}
        applicationName={controller.applicationName}
        renderBranding={controller.renderBranding}
      />
    );
  }

  return <ConnectedOrganizationList controller={controller} />;
}

function ConnectedOrganizationList({ controller }: { controller: OrganizationListReadyController }) {
  const screen = useOrganizationListScreenController(controller);
  const { createOrganization } = controller;

  return (
    <OrganizationListView
      {...controller}
      creating={screen.creating}
      createSteps={
        createOrganization ? (
          <OrganizationListCreateSteps
            model={{
              ...createOrganization,
              onComplete: organizationId => createOrganization.onComplete(organizationId).finally(screen.onCreated),
            }}
            onCancel={screen.onCancelCreate}
          />
        ) : undefined
      }
      onCreateOrganization={screen.onCreateOrganization}
    />
  );
}

function OrganizationListCreateSteps({
  model,
  onCancel,
}: {
  model: CreateOrganizationReadyModel;
  onCancel?: () => void;
}) {
  const steps = useCreateOrganizationFlow(model);

  return (
    <CreateOrganizationSteps
      {...steps}
      onCancel={onCancel}
    />
  );
}
