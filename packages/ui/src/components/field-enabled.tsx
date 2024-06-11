import { useClerk } from '@clerk/clerk-react';
import type { Attribute, EnvironmentResource } from '@clerk/types';

export function FieldEnabled({
  pick,
  children,
}: {
  /**
   * The name or list of the attributes to check if it is enabled.
   */
  pick: Attribute | Attribute[];
  /**
   * The children to render if the attribute is enabled.
   */
  children: React.ReactNode;
}) {
  const clerk = useClerk();
  const attrs = ((clerk as any)?.__unstable__environment as EnvironmentResource)?.userSettings.attributes;

  if (!attrs) {
    return null;
  }

  const names = !Array.isArray(pick) ? [pick] : pick;
  const isEnabled = names.every(name => attrs[name].enabled);

  if (!isEnabled) {
    return null;
  }

  return children;
}
