import { OptionsContext, useOptionsContext } from '@clerk/shared/react';

function OptionsProvider(props: React.ComponentPropsWithoutRef<typeof OptionsContext.Provider>) {
  return <OptionsContext.Provider {...props} />;
}
const useOptions = useOptionsContext;

export { OptionsProvider, useOptions };
