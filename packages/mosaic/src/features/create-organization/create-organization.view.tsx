import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import { useId, useState } from 'react';

import { Avatar } from '../../components/avatar';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { Flow, useFlowAutoFocus } from '../../components/flow';
import type { UseFormResult } from '../../components/form';
import { Input } from '../../components/input';
import { Text } from '../../components/text';
import type { LocalizableError } from '../../localization';
import { useErrorText, useMessages } from '../../localization';
import type { FileRejectionReason } from '../../primitives/file-upload';
import { FileUpload } from '../../primitives/file-upload';
import { Form } from '../../primitives/form';
import {
  canSendInvitations,
  InviteMembersFields,
} from '../organization-profile/organization-profile-members-panel/organization-profile-invite-members.fields';
import type { CreateOrganizationInviteController } from './create-organization.controller';
import { styles } from './create-organization.styles';
import type { CreateOrganizationStep, CreateOrganizationValues } from './create-organization.types';

const LOGO_MIME_TYPES = 'image/png,image/jpeg,image/gif,image/webp';
const LOGO_MAX_BYTES = 10 * 1000 * 1000;

const REJECTION_ERRORS: Record<FileRejectionReason, LocalizableError> = {
  accept: { code: 'avatar_file_type_invalid' },
  size: { code: 'avatar_file_size_exceeded' },
  overflow: { code: 'avatar_file_count_exceeded' },
};

export interface CreateOrganizationViewProps {
  step: CreateOrganizationStep;
  form: UseFormResult<CreateOrganizationValues>;
  slugEnabled: boolean;
  onNameChange: (name: string) => void;
  invite: CreateOrganizationInviteController;
  onFinish: () => void;
  renderBranding?: boolean;
}

export function CreateOrganizationView({ renderBranding = true, ...props }: CreateOrganizationViewProps) {
  return (
    <Card.Root renderBranding={renderBranding}>
      <Flow.Root
        value={props.step.step}
        state={props}
      >
        {current => (
          <>
            <Flow.Step ids={['create']}>
              <CreateStep {...current} />
            </Flow.Step>
            <Flow.Step ids={['invite']}>
              <InviteStep {...current} />
            </Flow.Step>
            <Flow.Step ids={['sent']}>
              <SentStep {...current} />
            </Flow.Step>
          </>
        )}
      </Flow.Root>
    </Card.Root>
  );
}

function CreateStep({ form, slugEnabled, onNameChange }: Omit<CreateOrganizationViewProps, 'renderBranding'>) {
  const m = useMessages('createOrganization');
  const { ref: nameRef, onChange: _onChange, ...nameControl } = form.register('name');
  const autoFocus = useFlowAutoFocus();
  const nameInput = useMergeRefs([nameRef, autoFocus]);
  const slugControl = form.register('slug');
  const slugFeedback = form.fields.slug.feedback;

  return (
    <>
      <Card.Header>
        <Card.Title>{m.create.title}</Card.Title>
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
        <LogoField
          name={form.values.name}
          logo={form.values.logo}
          disabled={form.isSubmitting}
          onChange={logo => form.setValue('logo', logo)}
        />
        <Field.Root
          required
          disabled={form.isSubmitting}
          focusableWhenDisabled
          invalid={form.fields.name.feedback?.type === 'error'}
        >
          <Field.Label>{m.create.nameLabel}</Field.Label>
          <Input
            ref={nameInput}
            autoComplete='off'
            placeholder={m.create.namePlaceholder}
            onChange={event => onNameChange(event.target.value)}
            {...nameControl}
          />
          <Field.Feedback feedback={form.fields.name.feedback} />
        </Field.Root>
        {slugEnabled ? (
          <Field.Root
            required
            disabled={form.isSubmitting}
            invalid={slugFeedback?.type === 'error'}
          >
            <Field.Label>{m.create.slugLabel}</Field.Label>
            <Input
              autoComplete='off'
              placeholder={m.create.slugPlaceholder}
              {...slugControl}
            />
            <Field.Feedback feedback={slugFeedback} />
          </Field.Root>
        ) : null}
      </Card.Content>
      <Card.Footer>
        <SubmitButton
          form={form.id}
          fullWidth
          isPending={form.isSubmitting}
          disabled={!form.canSubmit}
          focusableWhenDisabled
        >
          {m.create.submit}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}

function LogoField({
  name,
  logo,
  disabled,
  onChange,
}: {
  name: string;
  logo: File | null;
  disabled: boolean;
  onChange: (logo: File | null) => void;
}) {
  const m = useMessages('createOrganization');
  const errorText = useErrorText();
  const [rejection, setRejection] = useState<LocalizableError>();
  const previewUrl = FileUpload.useObjectUrl(logo ?? undefined);
  const labelId = useId();
  const initials = name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <FileUpload.Root
      disabled={disabled}
      accept={LOGO_MIME_TYPES}
      maxSize={LOGO_MAX_BYTES}
      aria-labelledby={labelId}
      onReject={rejections => {
        const rejected = rejections[0];
        setRejection(rejected ? REJECTION_ERRORS[rejected.reason] : undefined);
      }}
      onValueChange={files => {
        const file = files[0];
        if (file) {
          setRejection(undefined);
          onChange(file);
        }
      }}
    >
      <div {...stylex.props(styles.logo)}>
        <Avatar.Root
          shape='square'
          size='lg'
        >
          <Avatar.Image
            alt=''
            src={previewUrl}
          />
          <Avatar.Fallback>{initials}</Avatar.Fallback>
        </Avatar.Root>
        <div {...stylex.props(styles.logoContent)}>
          <Text
            id={labelId}
            render={<span />}
          >
            {m.create.logoLabel}
          </Text>
          <Text
            size='xs'
            color={rejection ? 'negative' : 'foreground-secondary'}
            role={rejection ? 'alert' : undefined}
          >
            {rejection ? errorText(rejection) : m.create.logoDescription}
          </Text>
        </div>
        <div {...stylex.props(styles.logoActions)}>
          {logo ? (
            <Button
              variant='ghost'
              color='neutral'
              size='sm'
              disabled={disabled}
              onClick={() => onChange(null)}
            >
              {m.create.removeLogo}
            </Button>
          ) : null}
          <FileUpload.Trigger
            render={
              <Button
                variant='outline'
                color='neutral'
                size='sm'
              />
            }
          >
            {m.create.uploadLogo}
          </FileUpload.Trigger>
        </div>
      </div>
    </FileUpload.Root>
  );
}

function InviteStep({ invite, onFinish }: Omit<CreateOrganizationViewProps, 'renderBranding'>) {
  const m = useMessages('createOrganization');
  const formId = useId();
  const canSubmit = canSendInvitations(invite);
  const emailInput = useFlowAutoFocus();

  return (
    <>
      <Card.Header>
        <Card.Title>{m.invite.title}</Card.Title>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {invite.error}
      </Card.Banner>
      <Card.Content
        render={
          <Form
            id={formId}
            onSubmit={event => {
              event.preventDefault();
              if (canSubmit && !invite.isPending) {
                invite.onSubmit();
              }
            }}
          />
        }
      >
        <InviteMembersFields
          emailInputRef={emailInput}
          {...invite}
        />
      </Card.Content>
      <Card.Footer>
        <Button
          variant='outline'
          color='neutral'
          fullWidth
          disabled={invite.isPending}
          onClick={onFinish}
        >
          {m.invite.skip}
        </Button>
        <SubmitButton
          form={formId}
          fullWidth
          isPending={invite.isPending}
          disabled={!canSubmit}
          focusableWhenDisabled
        >
          {m.invite.submit}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}

function SentStep({ onFinish }: Omit<CreateOrganizationViewProps, 'renderBranding'>) {
  const m = useMessages('createOrganization');
  const finishButton = useFlowAutoFocus();

  return (
    <>
      <Card.Header>
        <Card.Title>{m.sent.title}</Card.Title>
        <Card.Description>{m.sent.description}</Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button
          ref={finishButton}
          fullWidth
          onClick={onFinish}
        >
          {m.sent.finish}
        </Button>
      </Card.Footer>
    </>
  );
}
