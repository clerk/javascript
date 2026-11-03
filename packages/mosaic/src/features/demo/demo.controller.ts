import { useForm } from '../../components/form';
import type { ReadyDemoModel } from './demo.types';
import type { DemoViewProps } from './demo.view';

export function useDemoController(model: ReadyDemoModel): DemoViewProps {
  const form = useForm({
    initialValues: { name: model.instance.name },
    canSubmit: values => Boolean(values.name.trim()) && values.name.trim() !== model.instance.name,
    onSubmit: values => model.onSave({ name: values.name.trim() }),
  });

  return {
    instance: model.instance,
    isRefreshing: model.isRefreshing,
    refreshFailed: model.refreshFailed,
    form,
  };
}
