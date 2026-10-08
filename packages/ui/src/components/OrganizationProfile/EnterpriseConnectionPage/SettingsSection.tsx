import { CardStateProvider } from '@/elements/contexts';

import { useSettingsFormController } from './settings-section.controller';
import { type SettingsSectionProps, useSettingsSectionModel } from './settings-section.model';
import { SettingsFormView, SettingsSectionView } from './settings-section.view';

export type { ProviderFamily } from './settings-section.model';

export const SettingsSection = (props: SettingsSectionProps): JSX.Element => {
  const model = useSettingsSectionModel(props);
  return (
    <SettingsSectionView
      form={
        <CardStateProvider key={JSON.stringify([props.connection.id, props.family, model.signature])}>
          <SettingsForm model={model} />
        </CardStateProvider>
      }
    />
  );
};

const SettingsForm = ({ model }: { model: ReturnType<typeof useSettingsSectionModel> }): JSX.Element => {
  const controller = useSettingsFormController(model);
  return <SettingsFormView {...controller} />;
};
