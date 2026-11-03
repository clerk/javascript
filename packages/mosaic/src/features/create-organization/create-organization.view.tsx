import { useMergeRefs } from '@floating-ui/react';
import { useState } from 'react';

import { AvatarUpload } from '../../blocks/avatar-upload';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { Flow, useFlowAutoFocus } from '../../components/flow';
import type { UseFormResult } from '../../components/form';
import { Input } from '../../components/input';
import type { LocalizableError } from '../../localization';
import { useErrorText, useMessages } from '../../localization';
import { FileUpload } from '../../primitives/file-upload';
import { Form } from '../../primitives/form';
import { AVATAR_REJECTION_ERRORS } from '../../utils/avatar-upload';
import type { InviteMembersForm } from '../organization-profile/organization-profile-members-panel/organization-profile-invite-members.controller';
import { InviteMembersFields } from '../organization-profile/organization-profile-members-panel/organization-profile-invite-members.fields';
import type { CreateOrganizationStep, CreateOrganizationValues } from './create-organization.types';

export interface CreateOrganizationStepsProps {
  step: CreateOrganizationStep;
  form: UseFormResult<CreateOrganizationValues>;
  slugEnabled: boolean;
  onNameChange: (name: string) => void;
  invite: InviteMembersForm;
  onFinish: () => void;
  onCancel?: () => void;
}

export interface CreateOrganizationViewProps extends CreateOrganizationStepsProps {
  renderBranding?: boolean;
}

export function CreateOrganizationView({ renderBranding = true, ...props }: CreateOrganizationViewProps) {
  return (
    <Card.Root renderBranding={renderBranding}>
      <CreateOrganizationSteps {...props} />
    </Card.Root>
  );
}

export function CreateOrganizationSteps(props: CreateOrganizationStepsProps) {
  return (
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
  );
}

function CreateStep({ form, slugEnabled, onNameChange, onCancel }: CreateOrganizationStepsProps) {
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
        {onCancel ? (
          <Button
            variant='outline'
            color='neutral'
            disabled={form.isSubmitting}
            onClick={onCancel}
          >
            {m.create.cancel}
          </Button>
        ) : null}
        <SubmitButton
          form={form.id}
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

  return (
    <Field.Root
      disabled={disabled}
      invalid={Boolean(rejection)}
    >
      <AvatarUpload.Root
        name={name}
        imageUrl={previewUrl}
        hasImage={Boolean(logo)}
        onChange={file => {
          setRejection(undefined);
          onChange(file);
        }}
        onReject={rejections => {
          const rejected = rejections[0];
          setRejection(rejected ? AVATAR_REJECTION_ERRORS[rejected.reason] : undefined);
        }}
        onRemove={() => {
          setRejection(undefined);
          onChange(null);
        }}
      >
        <AvatarUpload.Dropzone>
          <AvatarUpload.Image
            shape='square'
            size='lg'
          />
          <Field.Content>
            <Field.Label>{m.create.logo.label}</Field.Label>
            <Field.Description>{m.create.logo.description}</Field.Description>
          </Field.Content>
          <AvatarUpload.Actions labels={m.create.logo} />
        </AvatarUpload.Dropzone>
      </AvatarUpload.Root>
      <Field.Feedback feedback={rejection ? { type: 'error', message: errorText(rejection) } : undefined} />
    </Field.Root>
  );
}

function InviteStep({ invite, onFinish }: CreateOrganizationStepsProps) {
  const m = useMessages('createOrganization');
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
            id={invite.formId}
            onSubmit={invite.onSubmit}
          />
        }
      >
        <InviteMembersFields
          emailInputRef={emailInput}
          invite={invite}
        />
      </Card.Content>
      <Card.Footer>
        <Button
          variant='outline'
          color='neutral'
          disabled={invite.isPending}
          onClick={onFinish}
        >
          {m.invite.skip}
        </Button>
        <SubmitButton
          form={invite.formId}
          isPending={invite.isPending}
          disabled={!invite.canSubmit}
          focusableWhenDisabled
        >
          {m.invite.submit}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}

function SentStep({ onFinish }: CreateOrganizationStepsProps) {
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
          onClick={onFinish}
        >
          {m.sent.finish}
        </Button>
      </Card.Footer>
    </>
  );
}
