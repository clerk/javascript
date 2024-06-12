import { useClerk } from '@clerk/clerk-react';
import type { Attribute, EnvironmentResource } from '@clerk/types';

type NegatedAttribute = `!${Attribute}`;
type PickOption = Attribute | NegatedAttribute;

export function FieldEnabled({
  pick,
  children,
}: {
  /**
   * The name or list of the attributes to check if it is enabled.
   */
  pick: PickOption | PickOption[];
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
  const namesToCheck = names.filter(name => !name.startsWith('!')) as Attribute[];
  const namesToNegate = names.filter(name => name.startsWith('!')).map(name => name.replace('!', '')) as Attribute[];

  const isEnabled = namesToCheck.every(name => attrs[name].enabled);
  const isDisabled = namesToNegate.some(name => attrs[name].enabled);

  if (!isEnabled || isDisabled) {
    return null;
  }

  return children;
}
