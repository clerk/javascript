import * as stylex from '@stylexjs/stylex';
import type { FormEvent, ReactElement } from 'react';
import { useEffect, useId, useRef, useState } from 'react';

import { Destructive } from '../../blocks/destructive';
import { Avatar } from '../../components/avatar';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Icon } from '../../components/icon';
import { Input } from '../../components/input';
import { Menu } from '../../components/menu';
import { Profile } from '../../components/profile';
import { Section } from '../../components/section';
import { Tooltip } from '../../components/tooltip';
import { VisuallyHidden } from '../../components/visually-hidden';
import { fill, plural, useLocale, useMessages } from '../../localization';
import type { FileRejection } from '../../primitives/file-upload';
import { FileUpload } from '../../primitives/file-upload';
import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './organization-profile-general-panel.styles';

const LOGO_MIME_TYPES = 'image/png,image/jpeg,image/gif,image/webp';
const LOGO_MAX_BYTES = 10 * 1000 * 1000;

export interface OrganizationProfileGeneralPanelViewProps {
  name: string;
  slug?: string;
  imageUrl?: string;
  hasImage?: boolean;
  membersCount: number;
  onLogoChange?: (file: File) => Promise<void>;
  onLogoReject?: (rejections: FileRejection[]) => void;
  onRemoveLogo?: () => Promise<void>;
  onSubmitName?: (name: string) => Promise<void>;
  onSubmitSlug?: (slug: string) => Promise<void>;
  onCopySlug?: (slug: string) => Promise<void>;
  onLeave?: () => Promise<void>;
  onDelete?: () => Promise<void>;
}

type EditDialogProps = {
  label: string;
  title: string;
  description?: string;
  value: string;
  onSubmit: (value: string) => Promise<void>;
};

function EditDialog({ label, title, description, value: savedValue, onSubmit }: EditDialogProps) {
  const m = useMessages('organizationProfile');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(savedValue);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const formId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const canSave = value.trim() !== '' && value !== savedValue;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSaving) {
      return;
    }
    if (nextOpen) {
      setValue(savedValue);
      setErrorMessage(undefined);
    }
    setOpen(nextOpen);
  };

  const save = async () => {
    setIsSaving(true);
    setErrorMessage(undefined);
    try {
      await onSubmit(value);
      setOpen(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : m.general.errors.generic);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSave && !isSaving) {
      void save();
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={handleOpenChange}
    >
      <Dialog.Trigger
        render={
          <Button
            color='neutral'
            size='sm'
            variant='outline'
          />
        }
      >
        {m.general.edit}
      </Dialog.Trigger>
      <Dialog.Popup
        variant='card'
        initialFocus={inputRef}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{title}</Card.Title>
            {description ? <Card.Description>{description}</Card.Description> : null}
          </Card.Header>
          <Card.Content
            render={
              <form
                id={formId}
                onSubmit={handleSubmit}
              />
            }
          >
            <Field.Root
              invalid={Boolean(errorMessage)}
              required
            >
              <Field.Label>{label}</Field.Label>
              <Input
                ref={inputRef}
                data-1p-ignore
                disabled={isSaving}
                value={value}
                onChange={event => {
                  setValue(event.target.value);
                  setErrorMessage(undefined);
                }}
              />
              <Field.Message>
                <Field.Error>{errorMessage}</Field.Error>
              </Field.Message>
            </Field.Root>
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
              render={
                <Button
                  color='neutral'
                  variant='outline'
                  fullWidth
                >
                  {m.general.cancel}
                </Button>
              }
            />
            <SubmitButton
              form={formId}
              fullWidth
              isPending={isSaving}
              disabled={!canSave}
              focusableWhenDisabled
            >
              {m.general.save}
            </SubmitButton>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

function LogoRow({
  name,
  imageUrl,
  hasImage = false,
  onChange,
  onReject,
  onRemove,
}: {
  name: string;
  imageUrl?: string;
  hasImage?: boolean;
  onChange?: (file: File) => Promise<void>;
  onReject?: (rejections: FileRejection[]) => void;
  onRemove?: () => Promise<void>;
}) {
  const m = useMessages('organizationProfile');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const initials = name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const run = async (action: () => Promise<void>) => {
    setIsSaving(true);
    setErrorMessage(undefined);
    try {
      await action();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : m.general.errors.generic);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FileUpload.Root
      accept={LOGO_MIME_TYPES}
      maxSize={LOGO_MAX_BYTES}
      render={<Section.Row />}
      onReject={rejections => {
        const rejection = rejections[0];
        setErrorMessage(rejection ? m.general.logo.errors[rejection.reason] : undefined);
        onReject?.(rejections);
      }}
      onValueChange={files => {
        const file = files[0];
        if (file && onChange) {
          void run(() => onChange(file));
        }
      }}
    >
      <Section.Item>
        <Section.Media size='lg'>
          <Avatar.Root
            shape='square'
            size='fit'
          >
            <Avatar.Image
              alt={name}
              src={imageUrl}
            />
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          </Avatar.Root>
        </Section.Media>
        <Section.Content>
          <Section.Label>{m.general.logo.label}</Section.Label>
          <Section.Description>{m.general.logo.description}</Section.Description>
        </Section.Content>
        <LogoActions
          canChange={Boolean(onChange)}
          hasImage={hasImage}
          isSaving={isSaving}
          onRemove={onRemove ? () => void run(onRemove) : undefined}
        />
      </Section.Item>
      {errorMessage ? <Section.Error>{errorMessage}</Section.Error> : null}
    </FileUpload.Root>
  );
}

function LogoActions({
  canChange,
  hasImage,
  isSaving,
  onRemove,
}: {
  canChange: boolean;
  hasImage: boolean;
  isSaving: boolean;
  onRemove?: () => void;
}) {
  const m = useMessages('organizationProfile');
  const { openFilePicker } = FileUpload.useFileUpload();

  if (!hasImage && canChange) {
    return (
      <Section.Actions>
        <FileUpload.Trigger
          render={
            <Button
              color='neutral'
              size='sm'
              variant='outline'
              disabled={isSaving}
              focusableWhenDisabled
            />
          }
        >
          {m.general.logo.upload}
        </FileUpload.Trigger>
      </Section.Actions>
    );
  }

  if (!hasImage || (!canChange && !onRemove)) {
    return null;
  }

  return (
    <Section.Actions>
      <Menu.Root placement='bottom-end'>
        <Menu.Trigger
          aria-label={m.general.logo.manage}
          disabled={isSaving}
        />
        <Menu.Popup>
          {canChange ? (
            <Menu.Item
              label={m.general.logo.change}
              onClick={openFilePicker}
            >
              <Menu.Media>
                <Icon name='pen' />
              </Menu.Media>
              <Menu.Label>{m.general.logo.change}</Menu.Label>
            </Menu.Item>
          ) : null}
          {onRemove ? (
            <Menu.Item
              color='negative'
              label={m.general.logo.remove}
              onClick={onRemove}
            >
              <Menu.Media>
                <Icon name='x' />
              </Menu.Media>
              <Menu.Label>{m.general.logo.remove}</Menu.Label>
            </Menu.Item>
          ) : null}
        </Menu.Popup>
      </Menu.Root>
    </Section.Actions>
  );
}

function CopySlug({ slug, onCopy }: { slug: string; onCopy: (slug: string) => Promise<void> }) {
  const m = useMessages('organizationProfile');
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setStatus('idle');
  }, [slug]);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const copy = async () => {
    setStatus('pending');
    try {
      await onCopy(slug);
      setStatus('success');
    } catch {
      setStatus('error');
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setStatus('idle'), 2000);
  };

  const feedback = status === 'success' ? m.general.slug.copied : status === 'error' ? m.general.slug.copyFailed : null;

  return (
    <>
      <Tooltip.Root open={Boolean(feedback)}>
        <Tooltip.Trigger
          render={
            <Button
              aria-label={m.general.slug.copy}
              color='neutral'
              shape='square'
              size='xs'
              variant='ghost'
              disabled={status === 'pending'}
              focusableWhenDisabled
              aria-busy={status === 'pending'}
            />
          }
          onClick={() => void copy()}
        >
          <Icon name='clipboard' />
        </Tooltip.Trigger>
        <Tooltip.Popup>{feedback}</Tooltip.Popup>
      </Tooltip.Root>
      <VisuallyHidden role='status'>{feedback}</VisuallyHidden>
    </>
  );
}

function WorkspaceDetails({
  name,
  slug,
  imageUrl,
  hasImage,
  onLogoChange,
  onLogoReject,
  onRemoveLogo,
  onSubmitName,
  onSubmitSlug,
  onCopySlug,
}: Omit<OrganizationProfileGeneralPanelViewProps, 'membersCount' | 'onLeave' | 'onDelete'>) {
  const m = useMessages('organizationProfile');

  return (
    <Section.Root>
      <Section.Title>{m.general.detailsTitle}</Section.Title>
      <Section.Group>
        <LogoRow
          name={name}
          imageUrl={imageUrl}
          hasImage={hasImage}
          onChange={onLogoChange}
          onReject={onLogoReject}
          onRemove={onRemoveLogo}
        />
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>{m.general.name.label}</Section.Label>
              <Section.Description>{name}</Section.Description>
            </Section.Content>
            {onSubmitName ? (
              <Section.Actions>
                <EditDialog
                  label={m.general.name.label}
                  title={m.general.name.dialogTitle}
                  value={name}
                  onSubmit={onSubmitName}
                />
              </Section.Actions>
            ) : null}
          </Section.Item>
        </Section.Row>
        {slug !== undefined ? (
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Label>{m.general.slug.label}</Section.Label>
                <Section.Description xstyle={styles.slugValue}>
                  <span>{slug || m.general.slug.empty}</span>
                  {slug && onCopySlug ? (
                    <CopySlug
                      slug={slug}
                      onCopy={onCopySlug}
                    />
                  ) : null}
                </Section.Description>
              </Section.Content>
              {onSubmitSlug ? (
                <Section.Actions>
                  <EditDialog
                    label={m.general.slug.label}
                    title={m.general.slug.dialogTitle}
                    description={m.general.slug.dialogDescription}
                    value={slug}
                    onSubmit={onSubmitSlug}
                  />
                </Section.Actions>
              ) : null}
            </Section.Item>
          </Section.Row>
        ) : null}
      </Section.Group>
    </Section.Root>
  );
}

function useDestructiveAction(action: () => Promise<void>) {
  const m = useMessages('organizationProfile');
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const onOpenChange = (nextOpen: boolean) => {
    if (isPending) {
      return;
    }
    setOpen(nextOpen);
    if (!nextOpen) {
      setErrorMessage(undefined);
    }
  };

  const onConfirm = async () => {
    if (isPending) {
      return;
    }
    setIsPending(true);
    setErrorMessage(undefined);
    try {
      await action();
      setOpen(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : m.general.errors.generic);
    } finally {
      setIsPending(false);
    }
  };

  return { open, onOpenChange, onConfirm, isPending, errorMessage };
}

function DangerAction({
  name,
  label,
  description,
  dialogTitle,
  dialogDescription,
  onAction,
}: {
  name: string;
  label: string;
  description: string;
  dialogTitle: string;
  dialogDescription: string;
  onAction: () => Promise<void>;
}) {
  const m = useMessages('organizationProfile');
  const action = useDestructiveAction(onAction);

  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{label}</Section.Label>
          <Section.Description>{description}</Section.Description>
        </Section.Content>
        <Section.Actions>
          <Destructive
            open={action.open}
            onOpenChange={action.onOpenChange}
            trigger={
              <Button
                color='negative'
                size='sm'
                variant='outline'
              >
                {label}
              </Button>
            }
            title={dialogTitle}
            description={dialogDescription}
            fieldLabel={fill(m.general.danger.fieldLabel, { phrase: name })}
            confirmationValue={name}
            actionLabel={label}
            cancelLabel={m.general.cancel}
            onDelete={() => void action.onConfirm()}
            isDeleting={action.isPending}
            errorMessage={action.errorMessage}
          />
        </Section.Actions>
      </Section.Item>
    </Section.Row>
  );
}

function DangerZone({
  name,
  membersCount,
  onLeave,
  onDelete,
}: Pick<OrganizationProfileGeneralPanelViewProps, 'name' | 'membersCount' | 'onLeave' | 'onDelete'>) {
  const m = useMessages('organizationProfile');
  const locale = useLocale();

  if (!onLeave && !onDelete) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Title>{m.general.danger.title}</Section.Title>
      <Section.Group>
        {onLeave ? (
          <DangerAction
            name={name}
            label={m.general.danger.leave.label}
            description={m.general.danger.leave.description}
            dialogTitle={m.general.danger.leave.dialogTitle}
            dialogDescription={m.general.danger.leave.dialogDescription}
            onAction={onLeave}
          />
        ) : null}
        {onDelete ? (
          <DangerAction
            name={name}
            label={m.general.danger.delete.label}
            description={m.general.danger.delete.description}
            dialogTitle={m.general.danger.delete.dialogTitle}
            dialogDescription={plural(m.general.danger.delete.dialogDescription, membersCount, locale, { name })}
            onAction={onDelete}
          />
        ) : null}
      </Section.Group>
    </Section.Root>
  );
}

export function OrganizationProfileGeneralPanelView({
  name,
  slug,
  imageUrl,
  hasImage = false,
  membersCount,
  onLogoChange,
  onLogoReject,
  onRemoveLogo,
  onSubmitName,
  onSubmitSlug,
  onCopySlug,
  onLeave,
  onDelete,
}: OrganizationProfileGeneralPanelViewProps): ReactElement {
  const m = useMessages('organizationProfile');

  return (
    <div {...mergeStyleProps(themeProps('organization-profile-general-panel'), stylex.props(styles.root))}>
      <Profile.PageTitle>{m.pages.general}</Profile.PageTitle>
      <div {...stylex.props(styles.sections)}>
        <WorkspaceDetails
          name={name}
          slug={slug}
          imageUrl={imageUrl}
          hasImage={hasImage}
          onLogoChange={onLogoChange}
          onLogoReject={onLogoReject}
          onRemoveLogo={onRemoveLogo}
          onSubmitName={onSubmitName}
          onSubmitSlug={onSubmitSlug}
          onCopySlug={onCopySlug}
        />
        <DangerZone
          name={name}
          membersCount={membersCount}
          onLeave={onLeave}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
