import { Badge } from '../../../components/badge';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { DataList } from '../../../components/data-list';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import { Input } from '../../../components/input';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import type { AccessController } from './access.controller';
import { styles } from './access.styles';
import { AccessCopyField } from './access-fields.view';

export function AccessDomainsView({ controller: c }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const form = c.domainForm;
  return (
    <>
      <Dialog.Root
        open={c.addingDomain}
        onOpenChange={c.onDomainOpenChange}
      >
        <Dialog.Popup scope='profile'>
          <Card.Root renderBranding={false}>
            <Card.Header>
              <Card.Title>{m.addDomainTitle}</Card.Title>
            </Card.Header>
            <Card.Banner color='negative'>{form.error}</Card.Banner>
            <Card.Content
              render={
                <Form
                  id={form.id}
                  onSubmit={form.handleSubmit}
                />
              }
            >
              <Field.Root
                disabled={form.isSubmitting}
                invalid={form.fields.name.feedback?.type === 'error'}
              >
                <Field.Label>{m.domain}</Field.Label>
                <Input
                  {...form.register('name')}
                  placeholder={m.domainPlaceholder}
                />
                <Field.Feedback feedback={form.fields.name.feedback} />
              </Field.Root>
            </Card.Content>
            <Card.Footer>
              <Button
                variant='outline'
                color='neutral'
                disabled={form.isSubmitting}
                onClick={() => c.onDomainOpenChange(false)}
              >
                {m.cancel}
              </Button>
              <SubmitButton
                form={form.id}
                isPending={form.isSubmitting}
                disabled={!form.canSubmit}
              >
                {m.add}
              </SubmitButton>
            </Card.Footer>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>
      <Dialog.Root
        open={c.verifyingDomain !== null}
        onOpenChange={c.onVerifyOpenChange}
      >
        <Dialog.Popup scope='profile'>
          <Card.Root renderBranding={false}>
            <Card.Header>
              <Card.Title xstyle={styles.connectionName}>
                {c.verifyingDomain}
                <Badge color='warning'>{m.domainUnverified}</Badge>
              </Card.Title>
            </Card.Header>
            <Card.Banner color='negative'>
              {c.verification.error ?? (c.verificationMissing ? m.notVerified : undefined)}
            </Card.Banner>
            <Card.Content>
              <Field.Description>{m.verifyDescription}</Field.Description>
              <DataList.Root divided={false}>
                <DataList.Item>
                  <DataList.Label>{m.recordType}</DataList.Label>
                  <DataList.Value>
                    <Badge color='neutral'>TXT</Badge>
                  </DataList.Value>
                </DataList.Item>
                <DataList.Item>
                  <DataList.Label>{m.host}</DataList.Label>
                  <DataList.Value>
                    <Badge color='neutral'>{c.verifyingDomain}</Badge>
                  </DataList.Value>
                </DataList.Item>
              </DataList.Root>
              <AccessCopyField
                label={m.value}
                value={c.data.serviceProvider.dnsValue}
              />
            </Card.Content>
            <Card.Footer>
              <Button
                variant='outline'
                color='neutral'
                disabled={c.verification.isPending}
                onClick={() => c.onVerifyOpenChange(false)}
              >
                {m.close}
              </Button>
              <SubmitButton
                type='button'
                isPending={c.verification.isPending}
                onClick={c.onCheckDomain}
              >
                {m.check}
              </SubmitButton>
            </Card.Footer>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>
    </>
  );
}
