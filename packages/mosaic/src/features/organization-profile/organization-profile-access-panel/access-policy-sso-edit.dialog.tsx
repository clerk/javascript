import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { Flow } from '../../../components/flow';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import type { AccessController } from './access.controller';
import { styles } from './access.styles';
import { ConnectionInput } from './access-connection-fields.view';
import { AccessConnectionTest } from './access-connection-test.view';
import { AccessCopyField } from './access-fields.view';
import { AccessStepIndicator } from './access-step-indicator.view';

export function AccessPolicySsoEditDialog({ controller }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const manager = controller.manager;
  const settingsFormId = `${manager.form.id}-settings`;
  const settings = manager.policyStep === 'settings';
  return (
    <Dialog.Root
      open={controller.editingPolicySso}
      onOpenChange={open => {
        if (!open) {
          manager.onClose();
        }
      }}
    >
      <Dialog.Popup compactPlacement='center'>
        <Card.Root
          size='lg'
          xstyle={styles.dialogCard}
          renderBranding={false}
        >
          <Card.Header xstyle={styles.dialogHeader}>
            <Card.Title xstyle={styles.dialogTitle}>{m.editSso}</Card.Title>
          </Card.Header>
          <Card.Banner color='negative'>{manager.form.error}</Card.Banner>
          <Flow.Root
            value={manager.policyStep}
            direction={settings ? -1 : 1}
            state={controller}
          >
            {current => (
              <>
                <Flow.Step ids={['settings']}>
                  <Card.Content
                    render={
                      <Form
                        id={settingsFormId}
                        onSubmit={current.manager.onPolicySubmit}
                      />
                    }
                  >
                    <ConnectionInput
                      controller={current.manager}
                      name='name'
                      label={m.name}
                    />
                    {current.manager.form.values.provider === 'oidc' ? (
                      <AccessCopyField
                        label={m.redirectUri}
                        value={current.manageServiceProvider?.redirectUri ?? ''}
                      />
                    ) : (
                      <>
                        <AccessCopyField
                          label={m.assertionConsumerService}
                          value={current.manageServiceProvider?.signOnUrl ?? ''}
                        />
                        <AccessCopyField
                          label={m.entityId}
                          value={current.manageServiceProvider?.audience ?? ''}
                        />
                      </>
                    )}
                  </Card.Content>
                </Flow.Step>
                <Flow.Step ids={['test']}>
                  <Card.Content
                    render={
                      <Form
                        id={current.manager.form.id}
                        onSubmit={current.manager.form.handleSubmit}
                      />
                    }
                  >
                    <AccessConnectionTest
                      form={current.manager.form}
                      kind='sso'
                      pending={current.manager.pending}
                      onStartTest={current.manager.onStartTest}
                      testUrl={current.manager.testUrl}
                      onTest={current.manager.onTest}
                      result={current.manager.result}
                      testing={current.manager.testing}
                      error={current.manager.error}
                      data={current.data}
                    />
                  </Card.Content>
                </Flow.Step>
              </>
            )}
          </Flow.Root>
          <Card.Footer xstyle={styles.footer}>
            <AccessStepIndicator
              current={settings ? 1 : 2}
              total={2}
            />
            <Button
              fullWidth={false}
              variant='outline'
              color='neutral'
              disabled={manager.pending}
              onClick={settings ? manager.onClose : manager.onPolicyBack}
            >
              {m.back}
            </Button>
            {settings ? (
              <Button
                fullWidth={false}
                disabled={!manager.canContinuePolicy}
                type='submit'
                form={settingsFormId}
              >
                {m.continue}
              </Button>
            ) : manager.form.isDirty ? (
              <SubmitButton
                fullWidth={false}
                form={manager.form.id}
                isPending={manager.form.isSubmitting}
                disabled={!manager.form.canSubmit}
              >
                {m.saveConnection}
              </SubmitButton>
            ) : (
              <Button
                fullWidth={false}
                disabled={manager.pending}
                onClick={manager.onClose}
              >
                {m.saveConnection}
              </Button>
            )}
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
