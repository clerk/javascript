import { SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import type { UseFormResult } from '../../components/form';
import { Input } from '../../components/input';
import { Text } from '../../components/text';
import { fill, useMessages } from '../../localization';
import { Form } from '../../primitives/form';
import type { DemoValues, ReadyDemoModel } from './demo.types';

export type DemoViewProps = Pick<ReadyDemoModel, 'instance' | 'isRefreshing' | 'refreshFailed'> & {
  form: UseFormResult<DemoValues>;
};

export function DemoView({ instance, isRefreshing, refreshFailed, form }: DemoViewProps) {
  const m = useMessages('demo');
  const { feedback } = form.fields.name;

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>{m.title}</Card.Title>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {form.error}
      </Card.Banner>
      <Card.Content
        render={
          <Form
            id={form.id}
            onSubmit={form.handleSubmit}
          />
        }
      >
        <Text>{fill(m.instance, { id: instance.id })}</Text>
        <Text>{fill(m.environment, { environment: instance.environment })}</Text>
        <Text>{fill(m.currentName, { name: instance.name })}</Text>
        <Field.Root
          required
          disabled={form.isSubmitting}
          focusableWhenDisabled
          invalid={feedback?.type === 'error'}
        >
          <Field.Label>{m.name}</Field.Label>
          <Input {...form.register('name')} />
          <Field.Feedback feedback={feedback} />
        </Field.Root>
        <SubmitButton
          fullWidth
          isPending={form.isSubmitting}
          pendingLabel={m.pending}
          disabled={!form.canSubmit}
          focusableWhenDisabled
        >
          {m.submit}
        </SubmitButton>
        {isRefreshing ? <Text role='status'>{m.refreshing}</Text> : null}
        {refreshFailed ? <Text role='alert'>{m.refreshError}</Text> : null}
      </Card.Content>
    </Card.Root>
  );
}

export function DemoLoadingView() {
  const m = useMessages('demo');
  return <Text role='status'>{m.loading}</Text>;
}

export function DemoErrorView() {
  const m = useMessages('demo');
  return <Text role='alert'>{m.loadError}</Text>;
}
