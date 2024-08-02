import { GlobalError as ElementsGlobalError } from '@clerk/elements/common';

import { useLocalizations } from '~/hooks/use-localizations';
import { Alert } from '~/primitives/alert';

export function GlobalError() {
  const { translateError } = useLocalizations();
  return (
    <ElementsGlobalError>
      {({ message, code }) => {
        return <Alert>{translateError({ message, code })}</Alert>;
      }}
    </ElementsGlobalError>
  );
}
