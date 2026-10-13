import type { ReactNode } from 'react';

import { Flow } from '../../components/flow';
import { Reverification } from './reverification';
import type { ReverificationController } from './reverification.controller';

interface ReverificationFlowProps {
  contentId: 'edit' | 'confirm';
  isVerifying: boolean;
  reverification: ReverificationController | undefined;
  onClose: () => void;
  children: ReactNode;
}

export function ReverificationFlow({
  contentId,
  isVerifying,
  reverification,
  onClose,
  children,
}: ReverificationFlowProps) {
  if (!reverification) {
    return <>{children}</>;
  }

  const step = isVerifying ? 'verify' : contentId;

  return (
    <Flow.Root
      value={step}
      direction={isVerifying ? 1 : -1}
      state={step}
    >
      {() => (
        <>
          <Flow.Step ids={[contentId]}>{children}</Flow.Step>
          <Flow.Step ids={['verify']}>
            <Reverification
              {...reverification}
              onClose={onClose}
            />
          </Flow.Step>
        </>
      )}
    </Flow.Root>
  );
}
