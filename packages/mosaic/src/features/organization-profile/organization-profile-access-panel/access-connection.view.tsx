import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { EmptyState } from '../../../components/empty-state';
import { Flow, useFlowAutoFocus } from '../../../components/flow';
import { ShieldCheck } from '../../../icons/glyphs/shield-check';
import { useMessages } from '../../../localization';
import { styles } from './access.styles';
import type { AccessConnectionController, AccessConnectionStepProps } from './access-connection.controller';
import { AssignmentStep, AttributesStep, MetadataStep, RolesStep } from './access-connection-instructions.view';
import { ConfigureStep, ProviderStep } from './access-connection-setup.view';
import { AccessConnectionTest } from './access-connection-test.view';
import { AccessStepIndicator } from './access-step-indicator.view';

export function AccessConnectionFooter({ controller }: { controller: AccessConnectionController }) {
  const m = useMessages('organizationProfile').access;
  const progress = controller.kind === 'sso' ? controller.progress : controller.directoryStep;
  const total = controller.kind === 'sso' ? 3 : 4;
  return (
    <>
      {controller.step !== 'saved' && (controller.kind === 'sso' || controller.step !== 'provider') ? (
        <AccessStepIndicator
          current={progress}
          total={total}
        />
      ) : null}
      {controller.step === 'saved' && controller.kind === 'sso' ? (
        <Button
          fullWidth={false}
          variant='outline'
          color='neutral'
          onClick={() => controller.onOpenChange(false)}
        >
          {m.cancel}
        </Button>
      ) : null}
      {controller.step === 'provider' ? (
        <Button
          fullWidth={false}
          variant='outline'
          color='neutral'
          disabled={controller.pending}
          onClick={() => controller.onOpenChange(false)}
        >
          {m.back}
        </Button>
      ) : controller.step !== 'saved' && (controller.kind === 'sso' || controller.step !== 'configure') ? (
        <Button
          fullWidth={false}
          variant='outline'
          color='neutral'
          disabled={controller.pending || (controller.step === 'configure' && !controller.canChangeProvider)}
          onClick={controller.onBack}
        >
          {m.back}
        </Button>
      ) : null}
      <SubmitButton
        fullWidth={false}
        type='button'
        isPending={controller.form.isSubmitting}
        disabled={!controller.canContinue}
        onClick={controller.onContinue}
      >
        {controller.canSave ? m.save : m.continue}
      </SubmitButton>
    </>
  );
}

export function AccessConnectionHeader() {
  const m = useMessages('organizationProfile').access;
  return (
    <Card.Header xstyle={styles.dialogHeader}>
      <Card.Title xstyle={styles.dialogTitle}>{m.ssoTitle}</Card.Title>
    </Card.Header>
  );
}

export function AccessConnectionSteps(props: AccessConnectionStepProps) {
  const controller = props.controller;
  return (
    <Flow.Root
      value={controller.step}
      direction={controller.direction}
      state={props}
    >
      {current => (
        <>
          <Flow.Step
            ids={['provider']}
            xstyle={styles.connectionStep}
          >
            <ProviderStep {...current} />
          </Flow.Step>
          <Flow.Step
            ids={['configure']}
            xstyle={styles.connectionStep}
          >
            <ConfigureStep {...current} />
          </Flow.Step>
          <Flow.Step
            ids={['attributes']}
            xstyle={styles.connectionStep}
          >
            <AttributesStep {...current} />
          </Flow.Step>
          <Flow.Step
            ids={['assignment']}
            xstyle={styles.connectionStep}
          >
            <AssignmentStep {...current} />
          </Flow.Step>
          <Flow.Step
            ids={['metadata']}
            xstyle={styles.connectionStep}
          >
            <MetadataStep {...current} />
          </Flow.Step>
          <Flow.Step
            ids={['test']}
            xstyle={styles.connectionStep}
          >
            <TestStep {...current} />
          </Flow.Step>
          <Flow.Step
            ids={['roles']}
            xstyle={styles.connectionStep}
          >
            <RolesStep {...current} />
          </Flow.Step>
          <Flow.Step
            ids={['saved', 'complete']}
            xstyle={styles.connectionStep}
          >
            <SavedStep controller={current.controller} />
          </Flow.Step>
        </>
      )}
    </Flow.Root>
  );
}

function SavedStep({ controller }: Pick<AccessConnectionStepProps, 'controller'>) {
  const m = useMessages('organizationProfile').access;
  const focus = useFlowAutoFocus<HTMLDivElement>();
  return (
    <EmptyState.Root
      ref={focus}
      tabIndex={-1}
      xstyle={styles.savedState}
    >
      <EmptyState.Icon glyph={ShieldCheck} />
      <EmptyState.Label>{controller.kind === 'sso' ? m.ssoSaved : m.directorySaved}</EmptyState.Label>
      <EmptyState.Description>{m.savedDescription}</EmptyState.Description>
    </EmptyState.Root>
  );
}

function TestStep({ controller, data }: AccessConnectionStepProps) {
  return (
    <AccessConnectionTest
      form={controller.form}
      kind={controller.kind}
      pending={controller.pending}
      onStartTest={controller.onStartTest}
      testUrl={controller.testUrl}
      onTest={controller.onTest}
      result={controller.result}
      testing={controller.test.isPending}
      error={controller.test.error}
      data={data}
    />
  );
}
