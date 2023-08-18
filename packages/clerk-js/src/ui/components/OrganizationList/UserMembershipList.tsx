import type { OrganizationMembershipResource, OrganizationResource } from '@clerk/types';

import { useCoreOrganizationList, useOrganizationListContext } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { useCardState, withCardStateProvider } from '../../elements';
import { useInView } from '../../hooks';
import {
  PreviewList,
  PreviewListDivider,
  PreviewListItem,
  PreviewListItemButton,
  PreviewListItems,
  PreviewListSpinner,
  PreviewListSubtitle,
} from './shared';
import { organizationListParams } from './utils';

export const UserMembershipList = () => {
  const { userMemberships } = useCoreOrganizationList({
    userMemberships: organizationListParams.userMemberships,
  });

  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (inView) {
        userMemberships.fetchNext?.();
      }
    },
  });

  if ((userMemberships.count ?? 0) === 0) {
    return null;
  }

  return (
    <PreviewList elementId='memberships'>
      <PreviewListSubtitle
        localizationKey={localizationKeys(
          (userMemberships.count ?? 0) > 1
            ? 'organizationList.organizationCountLabel_many'
            : 'organizationList.organizationCountLabel_single',
          {
            count: userMemberships.count,
          },
        )}
      />
      <PreviewListItems>
        {userMemberships?.data?.map(inv => {
          return (
            <MembershipPreview
              key={inv.id}
              {...inv}
            />
          );
        })}

        {userMemberships.hasNextPage && <PreviewListSpinner ref={ref} />}
      </PreviewListItems>
      <PreviewListDivider />
    </PreviewList>
  );
};

const SetActiveButton = (props: OrganizationResource) => {
  const card = useCardState();
  const { navigateAfterSelectOrganization } = useOrganizationListContext();
  const { isLoaded, setActive } = useCoreOrganizationList();

  if (!isLoaded) {
    return null;
  }
  const handleOrganizationClicked = (organization: OrganizationResource) => {
    return card.runAsync(() =>
      setActive({
        organization,
        beforeEmit: () => navigateAfterSelectOrganization(organization),
      }),
    );
  };

  return (
    <PreviewListItemButton
      isLoading={card.isLoading}
      onClick={() => handleOrganizationClicked(props)}
      localizationKey={localizationKeys('organizationList.action__setActiveOrganization')}
    />
  );
};

const MembershipPreview = withCardStateProvider((props: OrganizationMembershipResource) => {
  return (
    <PreviewListItem organizationData={props.organization}>
      <SetActiveButton {...props.organization} />
    </PreviewListItem>
  );
});
