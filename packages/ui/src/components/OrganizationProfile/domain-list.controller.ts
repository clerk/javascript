import { useEffect, useRef } from 'react';

import { useInView } from '@/ui/hooks';

import { localizationKeys } from '../../customizables';
import { useActionContext } from '../../elements/Action/ActionRoot';
import type { DomainListData, DomainListModel, DomainMenuData } from './domain-list.types';

export const useDomainListController = (model: DomainListModel): DomainListData => {
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  const { ref } = useInView({
    threshold: 0,
    onChange: inView => {
      if (inView && isMounted.current && model.canFetchNext) {
        model.fetchNext();
      }
    },
  });

  return {
    rows: model.rows,
    canManageDomains: model.canManageDomains,
    isLoading: model.isLoading,
    showSpinner: model.showSpinner,
    sentinelRef: model.canFetchNext ? ref : undefined,
  };
};

export const useDomainMenuController = (isVerificationComplete: boolean): DomainMenuData => {
  const { open } = useActionContext();

  return {
    actions: [
      {
        label: localizationKeys(
          isVerificationComplete
            ? 'organizationProfile.profilePage.domainSection.menuAction__manage'
            : 'organizationProfile.profilePage.domainSection.menuAction__verify',
        ),
        onClick: () => open(isVerificationComplete ? 'manage' : 'verify'),
      },
      {
        label: localizationKeys('organizationProfile.profilePage.domainSection.menuAction__remove'),
        isDestructive: true,
        onClick: () => open('remove'),
      },
    ],
  };
};
