import { useSecurityDirectorySyncModel } from './security-directory-sync.model';
import { SecurityDirectorySyncView } from './security-directory-sync.view';

type SecurityDirectorySyncSectionProps = {
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onConfigure: () => void;
};

/**
 * The Directory Sync entry point on the organization Security page, rendered
 * beneath the SSO section.
 */
export const SecurityDirectorySyncSection = ({
  organizationName,
  contentRef,
  onConfigure,
}: SecurityDirectorySyncSectionProps): JSX.Element => {
  const model = useSecurityDirectorySyncModel();

  return (
    <SecurityDirectorySyncView
      model={model}
      onConfigure={() => {
        if (model.canRun()) {
          onConfigure();
        }
      }}
      organizationName={organizationName}
      contentRef={contentRef}
    />
  );
};
