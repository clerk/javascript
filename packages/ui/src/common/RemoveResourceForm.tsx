import { withCardStateProvider } from '../elements/contexts';
import { useRemoveResourceController } from './remove-resource.controller';
import { useRemoveResourceModel } from './remove-resource.model';
import type { RemoveFormData, RemoveFormProps, RemoveResourceModel } from './remove-resource.types';
import { RemoveResourceView } from './remove-resource.view';

export const RemoveResourceForm = (props: RemoveFormProps) => {
  const { deleteResource, scopeKey, canRun, ...data } = props;
  const model = useRemoveResourceModel(deleteResource, { scopeKey, canRun });
  return (
    <RemoveResourceFormContent
      key={model.scopeKey}
      model={model}
      data={data}
    />
  );
};

const RemoveResourceFormContent = withCardStateProvider(
  ({ model, data }: { model: RemoveResourceModel; data: RemoveFormData }) => {
    const controller = useRemoveResourceController(model, data);

    return <RemoveResourceView controller={controller} />;
  },
);
