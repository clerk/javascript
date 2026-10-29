import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { Flow, useFlowAutoFocus } from '../../components/flow';
import type { UseFormResult } from '../../components/form';
import { Input } from '../../components/input';
import { Spinner } from '../../components/spinner';
import { Text } from '../../components/text';
import { useMessages } from '../../localization';
import { Form } from '../../primitives/form';
import { styles } from './waitlist.styles';
import type { WaitlistStep, WaitlistValues } from './waitlist.types';

export interface WaitlistViewProps {
  step: WaitlistStep;
  form: UseFormResult<WaitlistValues>;
  renderBranding: boolean;
  isRedirecting: boolean;
  onSignIn: () => void;
}

export function WaitlistView({ step, form, renderBranding, isRedirecting, onSignIn }: WaitlistViewProps) {
  const m = useMessages('waitlist');

  return (
    <Card.Root renderBranding={renderBranding}>
      <Flow.Root
        value={step}
        direction={1}
        state={step}
      >
        {() => (
          <>
            <Flow.Step ids={['form']}>
              <WaitlistFormStep form={form} />
            </Flow.Step>
            <Flow.Step ids={['joined']}>
              <WaitlistJoinedStep isRedirecting={isRedirecting} />
            </Flow.Step>
          </>
        )}
      </Flow.Root>
      <Card.Footer xstyle={styles.footer}>
        <Text
          size='xs'
          color='foreground-secondary'
          xstyle={styles.footerText}
        >
          {m.signIn.text}{' '}
          <Button
            type='button'
            variant='link'
            size='sm'
            onClick={onSignIn}
          >
            {m.signIn.action}
          </Button>
        </Text>
      </Card.Footer>
    </Card.Root>
  );
}

function WaitlistFormStep({ form }: { form: UseFormResult<WaitlistValues> }) {
  const m = useMessages('waitlist').start;

  return (
    <>
      <Card.Header>
        <Card.Title>{m.title}</Card.Title>
        <Card.Description>{m.description}</Card.Description>
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
        <EmailAddressField form={form} />
        <SubmitButton
          fullWidth
          isPending={form.isSubmitting}
          pendingLabel={m.pending}
          disabled={!form.canSubmit}
          focusableWhenDisabled
        >
          {m.submit}
        </SubmitButton>
      </Card.Content>
    </>
  );
}

function EmailAddressField({ form }: { form: UseFormResult<WaitlistValues> }) {
  const m = useMessages('waitlist').start;
  const { feedback } = form.fields.emailAddress;

  return (
    <Field.Root
      required
      disabled={form.isSubmitting}
      focusableWhenDisabled
      invalid={feedback?.type === 'error'}
    >
      <Field.Label>{m.emailLabel}</Field.Label>
      <Input
        type='email'
        autoComplete='email'
        placeholder={m.emailPlaceholder}
        {...form.register('emailAddress')}
      />
      <Field.Feedback feedback={feedback} />
    </Field.Root>
  );
}

function WaitlistJoinedStep({ isRedirecting }: { isRedirecting: boolean }) {
  const m = useMessages('waitlist').success;

  return (
    <>
      <Card.Header>
        <Card.Title
          ref={useFlowAutoFocus<HTMLHeadingElement>()}
          tabIndex={-1}
        >
          {m.title}
        </Card.Title>
        <Card.Description>{m.description}</Card.Description>
      </Card.Header>
      {isRedirecting ? (
        <Card.Content
          role='status'
          xstyle={styles.redirecting}
        >
          <Spinner size='sm' />
          <Text color='foreground-secondary'>{m.redirecting}</Text>
        </Card.Content>
      ) : null}
    </>
  );
}
