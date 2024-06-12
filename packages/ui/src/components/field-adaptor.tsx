import { useClerk } from '@clerk/clerk-react';
import type { Attribute, EnvironmentResource } from '@clerk/types';

export function FieldAdaptor({
  pick: name,
  children,
}: {
  pick: Attribute;
  children: (props: { isEnabled: boolean; isRequired: boolean }) => React.ReactNode;
}) {
  const clerk = useClerk();
  const attrs = ((clerk as any)?.__unstable__environment as EnvironmentResource)?.userSettings.attributes;

  if (!attrs) {
    return null;
  }

  const isEnabled = attrs[name].enabled;
  const isRequired = attrs[name].required;

  return children({ isEnabled, isRequired });
}
