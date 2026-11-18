import type { MutableRefObject } from 'react';
import { useRef } from 'react';

import { Banner } from '../../../components/banner';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import { Flow, useFlowAutoFocus } from '../../../components/flow';
import { Input } from '../../../components/input';
import { SegmentedControl } from '../../../components/segmented-control';
import { Select } from '../../../components/select';
import { plural, useLocale, useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import type { SSOBypassAddDialogController } from './sso-bypass.controller';
import type { SSOBypassAddMode, SSOBypassAddResult } from './sso-bypass.types';

export type SSOBypassAddDialogProps = SSOBypassAddDialogController;

export function SSOBypassAddDialog({ open, onOpenChange, finalFocus, ...current }: SSOBypassAddDialogProps) {
  const emailInput = useRef<HTMLInputElement>(null);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Popup
        initialFocus={emailInput}
        finalFocus={finalFocus}
      >
        <Card.Root
          elevation='overlay'
          size='lg'
          renderBranding={false}
        >
          <Flow.Root
            value={current.step}
            direction={current.step === 'form' ? -1 : 1}
            state={current}
          >
            {state => (
              <>
                <Flow.Step ids={['form']}>
                  <SSOBypassAddFormStep
                    {...state}
                    emailInputRef={emailInput}
                  />
                </Flow.Step>
                <Flow.Step ids={['result']}>
                  <SSOBypassAddResultStep result={state.result} />
                </Flow.Step>
              </>
            )}
          </Flow.Root>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

function SSOBypassAddFormStep({
  form,
  onModeChange,
  roles,
  isRolesLoading,
  isRolesError,
  emailInputRef,
}: Omit<SSOBypassAddDialogProps, 'open' | 'onOpenChange' | 'finalFocus'> & {
  emailInputRef: MutableRefObject<HTMLInputElement | null>;
}) {
  const m = useMessages('organizationProfile').security.ssoBypassPage.addDialog;
  const mode = form.values.mode;
  const emailField = form.register('emailAddress');

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
        <SegmentedControl.Root<SSOBypassAddMode>
          aria-label={m.modeLabel}
          value={mode}
          onValueChange={onModeChange}
          disabled={form.isSubmitting}
        >
          <SegmentedControl.Item value='email'>{m.modeEmail}</SegmentedControl.Item>
          <SegmentedControl.Item value='role'>{m.modeRole}</SegmentedControl.Item>
        </SegmentedControl.Root>
        {mode === 'email' ? (
          <Field.Root
            required
            disabled={form.isSubmitting}
            invalid={Boolean(form.fields.emailAddress.feedback)}
          >
            <Field.Label>{m.emailLabel}</Field.Label>
            <Input
              {...emailField}
              ref={element => {
                emailField.ref(element);
                emailInputRef.current = element;
              }}
              type='email'
              autoComplete='off'
              data-1p-ignore
              placeholder={m.emailPlaceholder}
            />
            <Field.Message>
              <Field.Error>{form.fields.emailAddress.feedback?.message}</Field.Error>
            </Field.Message>
          </Field.Root>
        ) : (
          <>
            <Field.Root
              required
              disabled={form.isSubmitting || isRolesLoading}
              invalid={Boolean(form.fields.role.feedback)}
            >
              <Field.Label>{m.roleLabel}</Field.Label>
              <Select.Root
                items={roles}
                value={form.values.role}
                onValueChange={role => form.setValue('role', role)}
              >
                <Select.Trigger placeholder={m.rolePlaceholder} />
                <Select.Popup />
              </Select.Root>
              <Field.Message>
                <Field.Error>{form.fields.role.feedback?.message}</Field.Error>
              </Field.Message>
            </Field.Root>
            {isRolesError ? (
              <Banner.Root
                color='negative'
                role='alert'
              >
                <Banner.Label>{m.rolesError}</Banner.Label>
              </Banner.Root>
            ) : null}
            <Banner.Root
              color='warning'
              role='status'
            >
              <Banner.Label>{m.roleWarning}</Banner.Label>
            </Banner.Root>
          </>
        )}
      </Card.Content>
      <Card.Footer>
        <Dialog.Close
          disabled={form.isSubmitting}
          render={
            <Button
              variant='outline'
              color='neutral'
            >
              {m.cancel}
            </Button>
          }
        />
        <SubmitButton
          form={form.id}
          isPending={form.isSubmitting}
          disabled={!form.canSubmit}
          focusableWhenDisabled
        >
          {m.submit}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}

function SSOBypassAddResultStep({ result }: { result: SSOBypassAddResult | undefined }) {
  const m = useMessages('organizationProfile').security.ssoBypassPage.addDialog;
  const locale = useLocale();
  const doneRef = useFlowAutoFocus<HTMLButtonElement>();
  if (!result) {
    return null;
  }
  return (
    <>
      <Card.Header>
        <Card.Title>{m.title}</Card.Title>
        <Card.Description>
          {result.mode === 'email' ? m.addedMember : plural(m.added, result.added, locale)}
        </Card.Description>
      </Card.Header>
      {result.skipped > 0 ? (
        <Card.Content>
          <Banner.Root
            color='warning'
            role='status'
          >
            <Banner.Label>{plural(m.skipped[result.skipReason], result.skipped, locale)}</Banner.Label>
          </Banner.Root>
        </Card.Content>
      ) : null}
      <Card.Footer>
        <Dialog.Close render={<Button ref={doneRef}>{m.done}</Button>} />
      </Card.Footer>
    </>
  );
}
