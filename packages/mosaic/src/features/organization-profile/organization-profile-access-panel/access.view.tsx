import { useRef } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { Flow } from '../../../components/flow';
import { Icon } from '../../../components/icon';
import { Panel } from '../../../components/panel';
import { Section } from '../../../components/section';
import { ArrowLeft } from '../../../icons/glyphs/arrow-left';
import { useMessages } from '../../../localization';
import { themeProps } from '../../../props';
import { rtl } from '../../../styles/rtl.styles';
import type { AccessController } from './access.controller';
import { styles } from './access.styles';
import { AccessConnectionFooter, AccessConnectionSteps } from './access-connection.view';
import { AccessDomainsView } from './access-domains.view';
import { AccessManageConnectionView } from './access-manage-connection.view';
import { AccessOverview } from './access-overview.view';
import { AccessPolicyView } from './access-policy.view';
import { AccessPolicySsoEditDialog } from './access-policy-sso-edit.dialog';

function AccessBackAction({ controller }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const manageBackLabel =
    controller.step === 'editor' ? (controller.form.values.id ? m.managePolicy : m.addPolicy) : m.connections;
  return (
    <Button
      variant='ghost'
      color='neutral'
      aria-label={controller.manageKind ? manageBackLabel : m.back}
      xstyle={controller.manageKind ? undefined : styles.back}
      disabled={controller.form.isSubmitting || controller.wizard.pending || controller.manager.pending}
      onClick={
        controller.manageKind
          ? controller.manager.onClose
          : controller.request?.kind === 'directory'
            ? () => controller.wizard.onOpenChange(false)
            : controller.onBack
      }
    >
      <Icon
        glyph={ArrowLeft}
        xstyle={rtl.mirror}
      />
      {controller.manageKind ? manageBackLabel : null}
    </Button>
  );
}

function AccessFooter({ controller }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  if (controller.manageKind) {
    const { form, pending } = controller.manager;
    return (
      <SubmitButton
        form={form.id}
        isPending={form.isSubmitting}
        disabled={!form.isDirty || !form.canSubmit || pending}
      >
        {m.saveConnection}
      </SubmitButton>
    );
  }
  if (controller.request?.kind === 'directory') {
    return <AccessConnectionFooter controller={controller.wizard} />;
  }
  return (
    <>
      {!controller.data.live || controller.form.values.authentication === 'sso' ? (
        <Button
          variant='outline'
          color='neutral'
          disabled={controller.form.isSubmitting}
          onClick={controller.onSaveDraft}
        >
          {m.saveDraft}
        </Button>
      ) : null}
      <Button
        disabled={controller.form.isSubmitting || !controller.canActivate}
        onClick={controller.onActivate}
      >
        {controller.form.values.id ? m.save : m.activate}
      </Button>
    </>
  );
}

export function accessProfilePage(controller: AccessController) {
  const editing = controller.pageStep !== 'list';
  return {
    page: <OrganizationProfileAccessPanelView controller={controller} />,
    layout: {
      contentTitle: controller.pageTitle,
      contentBackAction: editing ? <AccessBackAction controller={controller} /> : undefined,
      contentFooter: editing ? <AccessFooter controller={controller} /> : undefined,
    },
  };
}

function OrganizationProfileAccessPanelView({ controller }: { controller: AccessController }) {
  const firstProvider = useRef<HTMLButtonElement>(null);
  const m = useMessages('organizationProfile').access;
  return (
    <Panel.Root render={<div {...themeProps('organization-profile-access-panel')} />}>
      <Panel.Title>{controller.pageTitle}</Panel.Title>
      <Flow.Root
        xstyle={styles.pageFlow}
        value={controller.pageStep}
        direction={controller.direction}
        state={controller}
      >
        {current => (
          <>
            <Flow.Step
              ids={['list']}
              xstyle={styles.pageStep}
            >
              <AccessOverview controller={current} />
            </Flow.Step>
            <Flow.Step
              ids={['editor']}
              xstyle={styles.pageStep}
            >
              <AccessPolicyView controller={current} />
            </Flow.Step>
            <Flow.Step
              ids={['manage']}
              xstyle={styles.pageStep}
            >
              {current.manageKind ? (
                <AccessManageConnectionView
                  controller={current.manager}
                  kind={current.manageKind}
                  serviceProvider={current.manageServiceProvider}
                />
              ) : null}
            </Flow.Step>
            <Flow.Step
              ids={['directory']}
              xstyle={styles.pageStep}
            >
              <Card.Content xstyle={styles.inlineContent}>
                <Section.Error>{current.wizard.form.error}</Section.Error>
                <AccessConnectionSteps
                  controller={current.wizard}
                  data={current.data}
                />
              </Card.Content>
            </Flow.Step>
          </>
        )}
      </Flow.Root>
      <AccessDomainsView controller={controller} />
      <AccessPolicySsoEditDialog controller={controller} />
      <Dialog.Root
        open={controller.request?.kind === 'sso'}
        onOpenChange={controller.wizard.onOpenChange}
      >
        <Dialog.Popup
          compactPlacement='center'
          initialFocus={firstProvider}
        >
          <Card.Root
            size='lg'
            xstyle={styles.dialogCard}
            renderBranding={false}
          >
            <Card.Header>
              <Card.Title>{m.ssoTitle}</Card.Title>
            </Card.Header>
            <Card.Banner
              role='alert'
              color='negative'
            >
              {controller.wizard.form.error}
            </Card.Banner>
            <Card.Content>
              <AccessConnectionSteps
                firstProvider={firstProvider}
                controller={controller.wizard}
                data={controller.data}
              />
            </Card.Content>
            <Card.Footer xstyle={styles.footer}>
              <AccessConnectionFooter controller={controller.wizard} />
            </Card.Footer>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>
    </Panel.Root>
  );
}
