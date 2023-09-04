import type { ClerkPaginatedResponse } from '@clerk/types';

import type { useCoreOrganizationList } from '../../contexts';

export const organizationListParams = {
  userMemberships: {
    infinite: true,
  },
  userInvitations: {
    infinite: true,
  },
  userSuggestions: {
    infinite: true,
    status: ['pending', 'accepted'],
  },
} satisfies Parameters<typeof useCoreOrganizationList>[0];

export const updateCacheInPlace =
  (userSuggestions: any) =>
  <T extends { id: string }>(result: T): any => {
    userSuggestions?.unstable__mutate?.(result, {
      populateCache: (updatedItem: T, itemsInfinitePages: ClerkPaginatedResponse<T>[]) => {
        return itemsInfinitePages.map(item => {
          const newData = item.data.map(obj => {
            if (obj.id === updatedItem.id) {
              return {
                ...updatedItem,
              };
            }

            return obj;
          });
          return { ...item, data: newData };
        });
      },
      // Since `accept` gives back the updated information,
      // we don't need to revalidate here.
      revalidate: false,
    });
  };

export const removeItemFromPaginatedCache =
  (userInvitations: any) =>
  <T extends { id: string }>(result: T): any => {
    userInvitations?.unstable__mutate?.(result, {
      populateCache: (updatedItem: T, itemsInfinitePages: ClerkPaginatedResponse<T>[]) => {
        const prevTotalCount = itemsInfinitePages[itemsInfinitePages.length - 1].total_count;

        return itemsInfinitePages.map(item => {
          const newData = item.data.filter(obj => {
            return obj.id !== updatedItem.id;
          });
          return { ...item, data: newData, total_count: prevTotalCount - 1 };
        });
      },
      // Since `accept` gives back the updated information,
      // we don't need to revalidate here.
      revalidate: false,
    });
  };
