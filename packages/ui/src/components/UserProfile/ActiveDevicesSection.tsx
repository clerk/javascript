import { useActiveDeviceController } from './active-devices.controller';
import { useActiveDevicesModel } from './active-devices.model';
import type { ActiveDeviceModel } from './active-devices.types';
import { ActiveDevicesView, ActiveDeviceView } from './active-devices.view';

export const ActiveDevicesSection = () => {
  const model = useActiveDevicesModel();

  return (
    <ActiveDevicesView
      isLoading={model.isLoading}
      items={model.devices.map(device => (
        <ActiveDevice
          key={`${model.scopeKey}:${device.id}`}
          model={device}
        />
      ))}
    />
  );
};

const ActiveDevice = ({ model }: { model: ActiveDeviceModel }) => {
  const controller = useActiveDeviceController(model);

  return <ActiveDeviceView data={controller} />;
};
