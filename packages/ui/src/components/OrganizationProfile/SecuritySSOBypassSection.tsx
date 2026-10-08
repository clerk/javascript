import { useSecuritySSOBypassSectionModel } from './security-sso-bypass-section.model';
import { SecuritySSOBypassSectionView } from './security-sso-bypass-section.view';

type SecuritySSOBypassSectionProps = {
  onManage: () => void;
};

export const SecuritySSOBypassSection = ({ onManage }: SecuritySSOBypassSectionProps): JSX.Element | null => {
  const model = useSecuritySSOBypassSectionModel();

  return (
    <SecuritySSOBypassSectionView
      {...model}
      onManage={onManage}
    />
  );
};
