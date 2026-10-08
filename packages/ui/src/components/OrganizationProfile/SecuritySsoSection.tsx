import { useSecuritySsoConnectionRowController } from './security-sso-section.controller';
import { toSecuritySsoConnectionRow, useSsoInfoTooltipModel } from './security-sso-section.model';
import type { ConnectionRowProps, SecuritySsoSectionProps } from './security-sso-section.types';
import { SecuritySsoConnectionRowView, SecuritySsoSectionView, SsoInfoTooltipView } from './security-sso-section.view';

export const SecuritySsoSection = (props: SecuritySsoSectionProps): JSX.Element => {
  return (
    <SecuritySsoSectionView
      {...props}
      onAddConnection={() => {
        if (props.canRun()) {
          props.onConfigure?.({ kind: 'new' }, true);
        }
      }}
      ConnectionRow={ConnectionRow}
      SsoInfoTooltip={SsoInfoTooltip}
    />
  );
};

const ConnectionRow = (props: ConnectionRowProps): JSX.Element => {
  const model = toSecuritySsoConnectionRow(props);
  const controller = useSecuritySsoConnectionRowController(model);
  return <SecuritySsoConnectionRowView {...controller} />;
};

const SsoInfoTooltip = (): JSX.Element => {
  const model = useSsoInfoTooltipModel();
  return <SsoInfoTooltipView {...model} />;
};
