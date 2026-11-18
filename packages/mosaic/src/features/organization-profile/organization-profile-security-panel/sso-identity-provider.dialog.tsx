import * as stylex from '@stylexjs/stylex';
import type { ReactElement, ReactNode } from 'react';

import { Badge } from '../../../components/badge';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import type { FieldFeedback, UseFormResult } from '../../../components/form';
import { Icon } from '../../../components/icon';
import { Input } from '../../../components/input';
import { PasswordInput } from '../../../components/password-input';
import { Section } from '../../../components/section';
import { SegmentedControl } from '../../../components/segmented-control';
import { Text } from '../../../components/text';
import { useNow } from '../../../hooks/use-now';
import { Plus } from '../../../icons/glyphs/plus';
import { Trash } from '../../../icons/glyphs/trash';
import { fill, useLocale, useMessages } from '../../../localization';
import { FileUpload } from '../../../primitives/file-upload';
import { Form } from '../../../primitives/form';
import { truncationStyles } from '../../../styles/typography.styles';
import { formatDate } from '../../../utils/format-date';
import { styles } from './organization-profile-security-panel.styles';
import { CERTIFICATE_FILE_TYPES, certificateStatus } from './sso-certificates.utils';
import type { SSOSamlEditController } from './sso-connection.controller';
import { useSSOOidcEditController, useSSOSamlEditController } from './sso-connection.controller';
import type {
  SSOCertificate,
  SSOOidcDetails,
  SSOOidcMode,
  SSOOidcValues,
  SSOSamlDetails,
  SSOSamlMode,
  SSOSamlValues,
} from './sso-connections.types';

type TriggerSlot = (button: ReactElement) => ReactNode;

interface EditDialogShellProps<TValues extends object> {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormResult<TValues>;
  children: ReactNode;
  trigger: (slot: TriggerSlot) => ReactNode;
}

function EditDialogShell<TValues extends object>({
  isOpen,
  onOpenChange,
  form,
  children,
  trigger,
}: EditDialogShellProps<TValues>) {
  const m = useMessages('organizationProfile').security.ssoConnection.identityProviderDialog;
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      {trigger(button => (
        <Dialog.Trigger render={button} />
      ))}
      <Dialog.Popup>
        <Card.Root
          elevation='overlay'
          size='lg'
          renderBranding={false}
        >
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
            {children}
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
              disabled={form.isSubmitting}
              render={
                <Button
                  variant='outline'
                  color='neutral'
                />
              }
            >
              {m.cancel}
            </Dialog.Close>
            <SubmitButton
              form={form.id}
              isPending={form.isSubmitting}
              disabled={!form.canSubmit}
              focusableWhenDisabled
            >
              {m.save}
            </SubmitButton>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

interface UrlFieldControl {
  name: string;
  value: string;
  onChange: (event: { target: { value: string } }) => void;
  onBlur: () => void;
  ref: (element: HTMLElement | null) => void;
}

function UrlField({
  control,
  feedback,
  disabled,
  label,
  placeholder,
  required = true,
}: {
  control: UrlFieldControl;
  feedback: FieldFeedback | undefined;
  disabled: boolean;
  label: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <Field.Root
      required={required}
      disabled={disabled}
      invalid={feedback?.type === 'error'}
    >
      <Field.Label>{label}</Field.Label>
      <Input
        {...control}
        type='url'
        autoComplete='off'
        data-1p-ignore
        placeholder={placeholder}
      />
      <Field.Feedback feedback={feedback} />
    </Field.Root>
  );
}

export function SSOSamlEditDialog({
  saml,
  onSubmit,
  children,
}: {
  saml: SSOSamlDetails;
  onSubmit: (values: SSOSamlValues) => Promise<void>;
  children: (slot: TriggerSlot) => ReactNode;
}) {
  const m = useMessages('organizationProfile').security.ssoConnection;
  const d = m.identityProviderDialog;
  const controller = useSSOSamlEditController({ saml, onSubmit });
  const { form } = controller;

  return (
    <EditDialogShell
      isOpen={controller.isOpen}
      onOpenChange={controller.onOpenChange}
      form={form}
      trigger={children}
    >
      <SegmentedControl.Root<SSOSamlMode>
        aria-label={d.samlModeLabel}
        xstyle={styles.mode}
        value={form.values.mode}
        onValueChange={mode => form.setValue('mode', mode)}
        disabled={form.isSubmitting}
      >
        <SegmentedControl.Item value='metadataUrl'>{d.samlModeMetadataUrl}</SegmentedControl.Item>
        <SegmentedControl.Item value='manual'>{d.samlModeManual}</SegmentedControl.Item>
      </SegmentedControl.Root>
      {form.values.mode === 'metadataUrl' ? (
        <>
          <Text color='foreground-secondary'>{d.metadataUrlDescription}</Text>
          <UrlField
            control={form.register('idpMetadataUrl')}
            feedback={form.fields.idpMetadataUrl.feedback}
            disabled={form.isSubmitting}
            label={m.identityProvider.metadataUrl}
            placeholder={d.urlPlaceholder}
          />
        </>
      ) : (
        <>
          <Text color='foreground-secondary'>{d.manualDescription}</Text>
          <UrlField
            control={form.register('idpSsoUrl')}
            feedback={form.fields.idpSsoUrl.feedback}
            disabled={form.isSubmitting}
            label={m.identityProvider.ssoUrl}
            placeholder={d.urlPlaceholder}
          />
          <UrlField
            control={form.register('idpEntityId')}
            feedback={form.fields.idpEntityId.feedback}
            disabled={form.isSubmitting}
            label={m.identityProvider.issuer}
            placeholder={d.urlPlaceholder}
          />
          <CertificateList
            controller={controller}
            certificates={form.values.certificates}
          />
        </>
      )}
    </EditDialogShell>
  );
}

function CertificateList({
  controller,
  certificates,
}: {
  controller: SSOSamlEditController;
  certificates: SSOCertificate[];
}) {
  const d = useMessages('organizationProfile').security.ssoConnection.identityProviderDialog;
  const error = controller.certificateError ?? controller.form.fields.certificates.feedback?.message;
  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Content>
            <Section.Title>{d.signingCertificates}</Section.Title>
          </Section.Content>
          <Section.Actions>
            <FileUpload.Root
              accept={CERTIFICATE_FILE_TYPES}
              value={[]}
              onValueChange={controller.onCertificateFiles}
              disabled={!controller.canAddCertificate || controller.form.isSubmitting}
            >
              <FileUpload.Trigger
                render={
                  <Button
                    size='sm'
                    variant='outline'
                    color='neutral'
                  />
                }
              >
                <Icon glyph={Plus} />
                {certificates.length > 0 ? d.addCertificate : d.uploadCertificate}
              </FileUpload.Trigger>
            </FileUpload.Root>
          </Section.Actions>
        </Section.Header>
        {certificates.length > 0 ? (
          <Section.Body>
            <Section.Items>
              {certificates.map((entry, index) => (
                <CertificateItem
                  key={entry.certificate}
                  entry={entry}
                  isPrimary={index === 0}
                  position={index + 1}
                  canRemove={controller.canRemoveCertificate && !controller.form.isSubmitting}
                  onRemove={() => controller.onRemoveCertificate(entry.certificate)}
                />
              ))}
            </Section.Items>
          </Section.Body>
        ) : null}
      </Section.Group>
      <Section.Error>{error}</Section.Error>
    </Section.Root>
  );
}

function CertificateItem({
  entry,
  isPrimary,
  position,
  canRemove,
  onRemove,
}: {
  entry: SSOCertificate;
  isPrimary: boolean;
  position: number;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const d = useMessages('organizationProfile').security.ssoConnection.identityProviderDialog;
  const locale = useLocale();
  const status = certificateStatus(entry, useNow().getTime());
  const date = entry.expiresAt === null ? undefined : formatDate(new Date(entry.expiresAt), locale);
  const expiry = date ? fill(status === 'expired' ? d.expired : d.expires, { date }) : d.expiryAfterSave;

  return (
    <Section.Item>
      <Section.Content>
        <Section.Label>
          <span
            title={entry.certificate}
            {...stylex.props(truncationStyles.singleLine)}
          >
            {entry.certificate}
          </span>
          {isPrimary ? (
            <Badge
              color='neutral'
              title={d.primaryDescription}
            >
              {d.primary}
            </Badge>
          ) : null}
        </Section.Label>
        <Section.Description>
          {status === 'expired' || status === 'expiring' ? (
            <Badge color={status === 'expired' ? 'negative' : 'warning'}>{expiry}</Badge>
          ) : (
            expiry
          )}
        </Section.Description>
      </Section.Content>
      <Section.Actions>
        <Button
          size='sm'
          variant='ghost'
          color='neutral'
          shape='square'
          aria-label={fill(d.removeCertificate, { position: String(position) })}
          disabled={!canRemove}
          onClick={onRemove}
        >
          <Icon glyph={Trash} />
        </Button>
      </Section.Actions>
    </Section.Item>
  );
}

export function SSOOidcEditDialog({
  oidc,
  onSubmit,
  children,
}: {
  oidc: SSOOidcDetails;
  onSubmit: (values: SSOOidcValues) => Promise<void>;
  children: (slot: TriggerSlot) => ReactNode;
}) {
  const m = useMessages('organizationProfile').security.ssoConnection;
  const d = m.identityProviderDialog;
  const controller = useSSOOidcEditController({ oidc, onSubmit });
  const { form } = controller;
  const clientIdFeedback = form.fields.clientId.feedback;
  const secretFeedback = form.fields.clientSecret.feedback;

  return (
    <EditDialogShell
      isOpen={controller.isOpen}
      onOpenChange={controller.onOpenChange}
      form={form}
      trigger={children}
    >
      <Field.Root
        required
        disabled={form.isSubmitting}
        invalid={clientIdFeedback?.type === 'error'}
      >
        <Field.Label>{m.identityProvider.clientId}</Field.Label>
        <Input
          {...form.register('clientId')}
          autoComplete='off'
          data-1p-ignore
          placeholder={d.clientIdPlaceholder}
        />
        <Field.Feedback feedback={clientIdFeedback} />
      </Field.Root>
      <Field.Root
        disabled={form.isSubmitting}
        invalid={secretFeedback?.type === 'error'}
      >
        <Field.Label>{d.clientSecret}</Field.Label>
        <PasswordInput
          {...form.register('clientSecret')}
          autoComplete='off'
          data-1p-ignore
          placeholder={d.clientSecretPlaceholder}
          showPasswordLabel={d.showSecret}
          hidePasswordLabel={d.hideSecret}
        />
        <Field.Feedback feedback={secretFeedback} />
      </Field.Root>
      <SegmentedControl.Root<SSOOidcMode>
        aria-label={d.oidcModeLabel}
        xstyle={styles.mode}
        value={form.values.mode}
        onValueChange={mode => form.setValue('mode', mode)}
        disabled={form.isSubmitting}
      >
        <SegmentedControl.Item value='discoveryUrl'>{d.oidcModeDiscoveryUrl}</SegmentedControl.Item>
        <SegmentedControl.Item value='manual'>{d.oidcModeManual}</SegmentedControl.Item>
      </SegmentedControl.Root>
      {form.values.mode === 'discoveryUrl' ? (
        <>
          <Text color='foreground-secondary'>{d.discoveryUrlDescription}</Text>
          <UrlField
            control={form.register('discoveryUrl')}
            feedback={form.fields.discoveryUrl.feedback}
            disabled={form.isSubmitting}
            label={m.identityProvider.discoveryUrl}
            placeholder={d.urlPlaceholder}
          />
        </>
      ) : (
        <>
          <Text color='foreground-secondary'>{d.oidcManualDescription}</Text>
          <UrlField
            control={form.register('authUrl')}
            feedback={form.fields.authUrl.feedback}
            disabled={form.isSubmitting}
            label={m.identityProvider.authUrl}
            placeholder={d.urlPlaceholder}
          />
          <UrlField
            control={form.register('tokenUrl')}
            feedback={form.fields.tokenUrl.feedback}
            disabled={form.isSubmitting}
            label={m.identityProvider.tokenUrl}
            placeholder={d.urlPlaceholder}
          />
          <UrlField
            control={form.register('userInfoUrl')}
            feedback={form.fields.userInfoUrl.feedback}
            disabled={form.isSubmitting}
            label={m.identityProvider.userInfoUrl}
            placeholder={d.urlPlaceholder}
            required={false}
          />
        </>
      )}
    </EditDialogShell>
  );
}
