/**
 * Returns the closest profile scroll box to the event target.
 * @param mode - The mode of the component.
 * @param event - The event.
 * @returns The closest profile scroll box to the event target.
 */
export function getClosestProfileScrollBox(mode: 'mounted' | 'modal', event?: React.MouseEvent<HTMLElement>) {
  if (!event || mode === 'mounted') {
    return undefined;
  }

  const portalRoot = (event?.target as HTMLElement)?.closest(`[data-clerk-profile-scroll-box-root]`) ?? undefined;

  return portalRoot;
}
