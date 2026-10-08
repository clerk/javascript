import { useConfigureSSOHeaderController } from './configure-sso-header.controller';
import { useConfigureSSOHeaderModel } from './configure-sso-header.model';
import { ConfigureSSOHeaderView } from './configure-sso-header.view';

type ConfigureSSOHeaderProps = {
  title?: React.ReactNode;
};

export const ConfigureSSOHeader = ({ title }: ConfigureSSOHeaderProps): JSX.Element => {
  const model = useConfigureSSOHeaderModel();
  const controller = useConfigureSSOHeaderController(model);
  return (
    <ConfigureSSOHeaderView
      title={title}
      controller={controller}
    />
  );
};
