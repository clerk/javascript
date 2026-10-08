import { CardStateProvider } from '@/ui/elements/contexts';

import { useConfiguredDirectorySyncController } from './security-directory-sync.controller';
import type { useSecurityDirectorySyncModel } from './security-directory-sync.model';
import { ConfiguredDirectorySyncView } from './security-directory-sync.view';

type ConfiguredDirectorySyncStepProps = Pick<
  ReturnType<typeof useSecurityDirectorySyncModel>,
  'requestKey' | 'canRun' | 'status' | 'updateEnabled' | 'onDelete'
> & {
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onConfigure: () => void;
};

export const ConfiguredDirectorySyncStep = (props: ConfiguredDirectorySyncStepProps) => (
  <CardStateProvider key={props.requestKey}>
    <ConfiguredDirectorySyncContent {...props} />
  </CardStateProvider>
);

const ConfiguredDirectorySyncContent = ({
  organizationName,
  contentRef,
  onConfigure,
  ...model
}: ConfiguredDirectorySyncStepProps) => {
  const controller = useConfiguredDirectorySyncController(model, organizationName, contentRef, onConfigure);
  return <ConfiguredDirectorySyncView controller={controller} />;
};
