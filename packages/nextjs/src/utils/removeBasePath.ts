/**
 * Removes the Next.js basePath from the provided destination if set.
 * @param to Destination route to navigate to
 * @returns Destination without basePath, if set
 */
export function removeBasePath(to: string): string {
  let destination = to;
  const basePath = process.env.__NEXT_ROUTER_BASEPATH;
  if (basePath && destination.startsWith(basePath)) {
    destination = destination.slice(basePath.length);
  }

  return destination;
}
