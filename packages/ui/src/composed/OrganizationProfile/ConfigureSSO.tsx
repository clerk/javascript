import { useRef, type ReactNode } from 'react';

import { ConfigureSSOContent } from '../../components/ConfigureSSO/ConfigureSSO';
import { CardStateProvider } from '../../elements/contexts';

export const ConfigureSSO = (): ReactNode => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <CardStateProvider>
      <ConfigureSSOContent contentRef={contentRef} />
    </CardStateProvider>
  );
};
