const profileScrollBoxRootSelector = '[data-clerk-profile-scroll-box-root]';

/**
 * Returns the closest profile scroll box to the provided element.
 * @param element - The element to start searching from.
 * @returns The closest profile scroll box, if one exists.
 */
export function getClosestProfileScrollBoxFromElement(element?: HTMLElement | null): HTMLElement | undefined {
  const portalRoot = element?.closest(profileScrollBoxRootSelector);
  return portalRoot instanceof HTMLElement ? portalRoot : undefined;
}

/**
 * Returns the closest profile scroll box to the event target.
 * @param mode - The mode of the component.
 * @param event - The event whose target is used to find the profile scroll box.
 * @returns The closest profile scroll box, if one exists.
 */
export function getClosestProfileScrollBox(
  mode: 'mounted' | 'modal',
  event?: React.MouseEvent<HTMLElement>,
): HTMLElement | undefined {
  if (!event || mode === 'mounted') {
    return undefined;
  }

  return getClosestProfileScrollBoxFromElement(event.target as HTMLElement);
}
