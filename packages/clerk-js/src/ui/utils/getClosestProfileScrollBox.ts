import type { __experimental_CommerceSubscriberType } from '@clerk/types';

import { ORGANIZATION_PROFILE_CARD_SCROLLBOX_ID, USER_PROFILE_CARD_SCROLLBOX_ID } from '../constants';

/**
 * Returns the closest profile scroll box to the event target.
 * @param mode - The mode of the component.
 * @param subscriberType - The type of subscriber.
 * @param event - The event.
 * @returns The closest profile scroll box to the event target.
 */
export function getClosestProfileScrollBox(
  mode: 'mounted' | 'modal',
  subscriberType: __experimental_CommerceSubscriberType,
  event?: React.MouseEvent<HTMLElement>,
) {
  const portalRoot =
    mode === 'modal'
      ? subscriberType === 'user'
        ? (event?.target as HTMLElement)?.closest(`#${USER_PROFILE_CARD_SCROLLBOX_ID}`)
        : (event?.target as HTMLElement)?.closest(`#${ORGANIZATION_PROFILE_CARD_SCROLLBOX_ID}`)
      : undefined;

  return portalRoot;
}
