import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button } from '../../../components/button';
import { Field } from '../../../components/field';
import type { UseFormResult } from '../../../components/form';
import { Input } from '../../../components/input';
import { SegmentedControl } from '../../../components/segmented-control';
import { useMessages } from '../../../localization';
import { FileUpload } from '../../../primitives/file-upload';
import { styles } from './access.styles';
import type { AccessConnection, ConnectionConfiguration } from './access.types';
import { AccessCopyField, StepTitle } from './access-fields.view';

type ConnectionFieldsController = { form: UseFormResult<ConnectionConfiguration>; pending: boolean };

export function ConnectionInput({
  controller,
  name,
  label,
  type = 'text',
  readOnly,
  inputRef,
}: {
  controller: ConnectionFieldsController;
  name:
    | 'name'
    | 'metadataUrl'
    | 'signOnUrl'
    | 'issuer'
    | 'certificate'
    | 'clientId'
    | 'clientSecret'
    | 'tokenUrl'
    | 'userInfoUrl'
    | 'subjectEmail';
  readOnly?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  label: string;
  type?: 'text' | 'password' | 'url' | 'email';
}) {
  const m = useMessages('organizationProfile').access;
  const { ref, ...field } = controller.form.register(name);
  const mergedRef = useMergeRefs([ref, inputRef]);
  return (
    <Field.Root
      disabled={controller.pending}
      xstyle={name === 'metadataUrl' && styles.metadataInput}
    >
      <Field.Label>{label}</Field.Label>
      <Input
        readOnly={readOnly}
        type={type}
        placeholder={name === 'metadataUrl' ? m.pasteUrl : undefined}
        ref={mergedRef}
        {...field}
      />
    </Field.Root>
  );
}

export function GoogleDirectoryCredentials({ controller }: { controller: ConnectionFieldsController }) {
  const m = useMessages('organizationProfile').access;
  return (
    <>
      <ConnectionInput
        controller={controller}
        name='subjectEmail'
        label={m.subjectEmail}
        type='email'
      />
      <ConnectionFileField
        controller={controller}
        name='serviceAccountFile'
        label={m.serviceAccount}
        accept='.json,application/json'
      />
    </>
  );
}

export function SsoConnectValues({
  oidc,
  serviceProvider,
}: {
  oidc: boolean;
  serviceProvider?: Pick<AccessConnection, 'redirectUri' | 'signOnUrl' | 'audience'>;
}) {
  const m = useMessages('organizationProfile').access;
  return (
    <>
      {oidc ? (
        <AccessCopyField
          label={m.redirectUri}
          value={serviceProvider?.redirectUri ?? ''}
        />
      ) : (
        <>
          <AccessCopyField
            label={m.signOnUrl}
            value={serviceProvider?.signOnUrl ?? ''}
          />
          <AccessCopyField
            label={m.audience}
            value={serviceProvider?.audience ?? ''}
          />
        </>
      )}
    </>
  );
}

export function SsoMetadataFields({
  controller,
  showInstructions = false,
}: {
  controller: ConnectionFieldsController & { onModeChange: (value: string) => void };
  showInstructions?: boolean;
}) {
  const m = useMessages('organizationProfile').access;
  const oidc = controller.form.values.provider === 'oidc';
  const titles = {
    metadata: controller.form.values.provider === 'okta' ? m.oktaMetadataHeading : m.metadataHeading,
    file: m.metadataFile,
    manual: m.manual,
  };
  return (
    <>
      {oidc ? (
        <>
          <ConnectionInput
            controller={controller}
            name='clientId'
            label={m.clientId}
          />
          <ConnectionInput
            controller={controller}
            name='clientSecret'
            label={m.clientSecret}
            type='password'
          />
        </>
      ) : null}
      <SegmentedControl.Root
        value={controller.form.values.mode}
        onValueChange={controller.onModeChange}
        xstyle={styles.fit}
        aria-label={m.configure}
      >
        <SegmentedControl.Item value='metadata'>{m.metadata}</SegmentedControl.Item>
        {!oidc ? <SegmentedControl.Item value='file'>{m.metadataFile}</SegmentedControl.Item> : null}
        <SegmentedControl.Item value='manual'>{m.manual}</SegmentedControl.Item>
      </SegmentedControl.Root>
      <div {...stylex.props(styles.headingGroup)}>
        <StepTitle
          description={
            showInstructions && controller.form.values.mode === 'metadata' && controller.form.values.provider === 'okta'
              ? m.oktaMetadataInstructions
              : undefined
          }
        >
          {titles[controller.form.values.mode]}
        </StepTitle>
      </div>
      {controller.form.values.mode === 'metadata' ? (
        <ConnectionInput
          controller={controller}
          name='metadataUrl'
          label={oidc ? m.discoveryUrl : m.metadataUrl}
          type='url'
        />
      ) : null}
      {controller.form.values.mode === 'file' ? (
        <ConnectionFileField
          controller={controller}
          name='metadataFile'
          label={m.file}
          accept='.xml,text/xml,application/xml'
        />
      ) : null}
      {controller.form.values.mode === 'manual' ? (
        <>
          <ConnectionInput
            controller={controller}
            name='signOnUrl'
            label={m.signOnUrl}
            type='url'
          />
          {oidc ? (
            <>
              <ConnectionInput
                controller={controller}
                name='tokenUrl'
                label={m.tokenUrl}
                type='url'
              />
              <ConnectionInput
                controller={controller}
                name='userInfoUrl'
                label={m.userInfoUrl}
                type='url'
              />
            </>
          ) : (
            <>
              <ConnectionInput
                controller={controller}
                name='issuer'
                label={m.issuer}
              />
              <ConnectionInput
                controller={controller}
                name='certificate'
                label={m.certificate}
              />
            </>
          )}
        </>
      ) : null}
    </>
  );
}

function ConnectionFileField({
  controller: { form, pending },
  name,
  label,
  accept,
}: {
  controller: ConnectionFieldsController;
  name: 'serviceAccountFile' | 'metadataFile';
  label: string;
  accept: string;
}) {
  const m = useMessages('organizationProfile').access;
  const file = form.values[name];
  const inputId = `${form.id}-${name}`;
  const feedback = form.fields[name].feedback;
  return (
    <Field.Root
      disabled={pending}
      invalid={feedback?.type === 'error'}
    >
      <Field.Label htmlFor={inputId}>{label}</Field.Label>
      <FileUpload.Root
        inputId={inputId}
        value={file ? [file] : []}
        accept={accept}
        disabled={pending}
        onValueChange={([selected]) => {
          form.setValue(name, selected ?? null);
          form.touch(name);
        }}
      >
        <FileUpload.Trigger
          render={
            <Button
              variant='outline'
              color='neutral'
            />
          }
        >
          {m.chooseFile}
        </FileUpload.Trigger>
      </FileUpload.Root>
      {file ? <Field.Description>{file.name}</Field.Description> : null}
      <Field.Feedback feedback={feedback} />
    </Field.Root>
  );
}
