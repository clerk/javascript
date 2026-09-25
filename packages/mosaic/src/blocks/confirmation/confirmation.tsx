import { isReverificationCancelledError } from '@clerk/shared/error';
import type { ReactNode } from 'react';

import { Banner } from '../../components/banner';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import type { DialogFocusTarget, DialogHandle, DialogRootProps, DialogTriggerProps } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { Flow } from '../../components/flow';
import { Reverification, type ReverificationController } from '../../features/reverification';
import { type FromPayload, resolveFromPayload as resolve } from '../../utils/resolve-from-payload';
import { useConfirmationController } from './confirmation.controller';

/** The weight the confirming button carries: an undoable action takes `primary`. */
export type ConfirmationColor = 'negative' | 'primary';

interface ConfirmationCardProps {
  color: ConfirmationColor;
  finalFocus: DialogFocusTarget | undefined;
  title: string;
  description: ReactNode;
  actionLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  isConfirming: boolean;
  errorMessage: string | undefined;
  reverification?: ReverificationController;
}

function ConfirmationCard({
  color,
  finalFocus,
  title,
  description,
  actionLabel,
  cancelLabel,
  onConfirm,
  isConfirming,
  errorMessage,
  reverification,
}: ConfirmationCardProps) {
  const step =
    reverification && reverification.status !== 'idle' && reverification.status !== 'loading' ? 'verify' : 'confirm';

  const confirmation = (
    <>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
      </Card.Header>
      {errorMessage ? (
        <Card.Content>
          <Banner.Root
            role='alert'
            color='negative'
          >
            <Banner.Label>{errorMessage}</Banner.Label>
          </Banner.Root>
        </Card.Content>
      ) : null}
      <Card.Footer>
        <Dialog.Close
          render={
            <Button
              variant='outline'
              fullWidth
            >
              {cancelLabel}
            </Button>
          }
        />
        <SubmitButton
          type='button'
          fullWidth
          color={color}
          isPending={isConfirming}
          onClick={onConfirm}
        >
          {actionLabel}
        </SubmitButton>
      </Card.Footer>
    </>
  );

  const content = reverification ? (
    <Flow.Root
      value={step}
      direction={step === 'verify' ? 1 : -1}
      state={step}
    >
      {() => (
        <>
          <Flow.Step ids={['confirm']}>{confirmation}</Flow.Step>
          <Flow.Step ids={['verify']}>
            {reverification ? (
              <>
                <Reverification {...reverification} />
                <Card.Footer>
                  <Button
                    variant='outline'
                    color='neutral'
                    fullWidth
                    disabled={reverification.phase === 'retrying'}
                    onClick={reverification.status === 'idle' ? undefined : reverification.onCancel}
                  >
                    {cancelLabel}
                  </Button>
                </Card.Footer>
              </>
            ) : null}
          </Flow.Step>
        </>
      )}
    </Flow.Root>
  ) : (
    confirmation
  );

  return (
    <Dialog.Popup
      compactPlacement='sheet'
      finalFocus={finalFocus}
    >
      <Card.Root
        elevation='overlay'
        renderBranding={false}
      >
        {content}
      </Card.Root>
    </Dialog.Popup>
  );
}

export interface ConfirmationControlledProps {
  /** Whether the dialog is open */
  open: boolean;
  /** The weight the confirming button carries. An action that can be undone takes `primary` (default: `negative`) */
  color?: ConfirmationColor;
  /**
   * Where focus returns when the dialog closes. Default: the trigger — which a confirmed removal
   * may have taken off the page, so a list hands back the row that replaced it instead.
   */
  finalFocus?: DialogFocusTarget;
  /** Callback when open state changes */
  onOpenChange: NonNullable<DialogRootProps['onOpenChange']>;
  /** Element that opens the dialog */
  trigger?: DialogTriggerProps['render'];
  /** Dialog heading */
  title: string;
  /** What the action does and why it warrants a second look. Takes markup, for a name to emphasise */
  description: ReactNode;
  /** Text of the confirming button */
  actionLabel: string;
  /** Text of the cancel button (default: "Cancel") */
  cancelLabel?: string;
  /** Callback when the action is confirmed */
  onConfirm: () => void;
  /** Whether the confirmed action is in progress */
  isConfirming?: boolean;
  /** Error message to display if the confirmed action fails */
  errorMessage?: string;
  reverification?: ReverificationController;
}

function ControlledConfirmation({
  open,
  color = 'negative',
  finalFocus,
  onOpenChange,
  trigger,
  title,
  description,
  actionLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  isConfirming = false,
  errorMessage,
  reverification,
}: ConfirmationControlledProps) {
  const handleOpenChange: NonNullable<DialogRootProps['onOpenChange']> = (...args) => {
    const [nextOpen] = args;
    if (!nextOpen && reverification && reverification.status !== 'idle') {
      reverification.onCancel?.();
    }
    onOpenChange(...args);
  };

  return (
    <Dialog.Root
      role='alertdialog'
      open={open}
      onOpenChange={handleOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <ConfirmationCard
        color={color}
        finalFocus={finalFocus}
        title={title}
        description={description}
        actionLabel={actionLabel}
        cancelLabel={cancelLabel}
        onConfirm={onConfirm}
        isConfirming={isConfirming}
        errorMessage={errorMessage}
        reverification={reverification}
      />
    </Dialog.Root>
  );
}

/**
 * Opens the block from anywhere with the payload the confirmation is about. Create with
 * `Confirmation.createHandle()`. The copy is derived from the payload, so `open` requires one.
 */
export interface ConfirmationHandle<Payload> extends DialogHandle<Payload> {
  open(payload: Payload): void;
}

function createHandle<Payload>(): ConfirmationHandle<Payload> {
  return Dialog.createHandle<Payload>();
}

export interface ConfirmationHandleProps<Payload> {
  /** Opens the dialog with a payload from anywhere: `handle.open(payload)` */
  handle: ConfirmationHandle<Payload>;
  /** The weight the confirming button carries. An action that can be undone takes `primary` (default: `negative`) */
  color?: ConfirmationColor;
  /**
   * Where focus returns when the dialog closes. Default: the trigger — which a confirmed removal
   * may have taken off the page, so a list hands back the row that replaced it instead.
   */
  finalFocus?: DialogFocusTarget;
  /** Dialog heading, or a function of the payload */
  title: FromPayload<Payload, string>;
  /** What the action does and why it warrants a second look, or a function of the payload. Takes markup, for a name to emphasise */
  description: FromPayload<Payload, ReactNode>;
  /** Text of the confirming button, or a function of the payload */
  actionLabel: FromPayload<Payload, string>;
  /** Text of the cancel button (default: "Cancel") */
  cancelLabel?: string;
  /** Runs the action for the payload. Resolve to close the dialog; reject with an `Error` to keep it open showing why */
  onConfirm: (payload: Payload) => Promise<void> | void;
  /** Challenge shown in place of the confirmation while the action waits on reverification. Cancelling it closes the dialog */
  reverification?: ReverificationController;
}

function HandleConfirmation<Payload>({
  handle,
  color = 'negative',
  finalFocus,
  title,
  description,
  actionLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  reverification,
}: ConfirmationHandleProps<Payload>) {
  const controller = useConfirmationController();

  const handleOpenChange = (open: boolean) => {
    if (!open && reverification && reverification.status !== 'idle') {
      reverification.onCancel?.();
    }
    controller.onOpenChange(open);
  };

  return (
    <Dialog.Root
      role='alertdialog'
      handle={handle}
      open={controller.isOpen}
      onOpenChange={handleOpenChange}
    >
      {({ payload }) =>
        payload === undefined ? null : (
          <ConfirmationCard
            color={color}
            finalFocus={finalFocus}
            title={resolve(title, payload)}
            description={resolve(description, payload)}
            actionLabel={resolve(actionLabel, payload)}
            cancelLabel={cancelLabel}
            onConfirm={() =>
              controller.onConfirm(async () => {
                try {
                  await onConfirm(payload);
                } catch (error) {
                  if (!isReverificationCancelledError(error)) {
                    throw error;
                  }
                }
              })
            }
            isConfirming={controller.isConfirming}
            errorMessage={controller.errorMessage}
            reverification={reverification}
          />
        )
      }
    </Dialog.Root>
  );
}

export type ConfirmationProps<Payload = unknown> = ConfirmationControlledProps | ConfirmationHandleProps<Payload>;

/**
 * Confirmation dialog for an action worth a second look but not worth making the user type for.
 * Use `Destructive` for the destructive actions that are. `color` sets the weight the confirming
 * button carries: `negative` for what cannot be undone, `primary` for what can.
 *
 * An `alertdialog`: it announces as an interruption, an outside press cannot answer it, and the
 * card withholds its corner dismiss. Escape still closes it, the way the cancel action does. Under
 * the phone band it arrives as a bottom sheet, within reach of the thumb that has to answer it.
 *
 * Two forms. Controlled: the caller owns `open`, `isConfirming`, and `errorMessage`, and the
 * block holds nothing of its own. With a `handle`: the block owns all three. Mount it once,
 * open it from anywhere with `handle.open(payload)`, and derive the copy and the action from
 * that payload; the promise `onConfirm` returns decides whether it closes or explains a failure.
 *
 * @example
 * <Confirmation
 *   open={snapshot.value === 'confirming' || snapshot.value === 'removing'}
 *   onOpenChange={open => send({ type: open ? 'OPEN' : 'CANCEL' })}
 *   trigger={<Button color='negative'>Remove</Button>}
 *   title='Remove connected account'
 *   description='Google will be removed from this account. You will no longer be able to use this connected account and any dependent features will no longer work.'
 *   actionLabel='Remove'
 *   onConfirm={() => send({ type: 'CONFIRM' })}
 *   isConfirming={snapshot.value === 'removing'}
 *   errorMessage={snapshot.context.errorMessage}
 * />
 *
 * @example
 * const removeMember = Confirmation.createHandle<Member>();
 *
 * <Confirmation
 *   handle={removeMember}
 *   title='Remove member'
 *   description={member => <><strong>{member.name}</strong> will be removed from the organization.</>}
 *   actionLabel='Remove'
 *   onConfirm={member => api.removeMember(member.id)}
 * />
 *
 * <Menu.Item color='negative' onClick={() => removeMember.open(member)}>Remove</Menu.Item>
 */
export function Confirmation<Payload = unknown>(props: ConfirmationProps<Payload>) {
  return 'handle' in props ? <HandleConfirmation<Payload> {...props} /> : <ControlledConfirmation {...props} />;
}

Confirmation.createHandle = createHandle;
