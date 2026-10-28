import type { ReactNode } from 'react';

import { Card } from '../../components/card';
import type { DialogFocusTarget, DialogTriggerProps } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { Flow } from '../../components/flow';
import { Reverification } from '../../features/reverification';
import { type FromPayload, resolveFromPayload as resolve } from '../../utils/resolve-from-payload';
import type { ConfirmController } from './confirm.controller';

export interface ConfirmBlockProps<Payload> {
  controller: ConfirmController<Payload>;
  /** Element that opens the dialog, for a dialog that sits next to its button. A trigger carries no payload, so only a payload-less controller takes one */
  trigger?: [Payload] extends [void] ? DialogTriggerProps['render'] : never;
  /**
   * Where focus returns when the dialog closes. Default: the trigger
   */
  finalFocus?: DialogFocusTarget;
  /** Dialog heading, or a function of the payload */
  title: FromPayload<Payload, string>;
  /** What the action does and why it warrants a second look, or a function of the payload. Takes markup. */
  description: FromPayload<Payload, ReactNode>;
  /** Text of the confirming button, or a function of the payload */
  actionLabel: FromPayload<Payload, string>;
  /** Text of the cancel button (default: "Cancel") */
  cancelLabel?: string;
}

/** What the confirm step renders from: the copy resolved for the payload and the controller's state. */
export interface ConfirmStepProps<Payload> {
  payload: Payload;
  title: string;
  description: ReactNode;
  actionLabel: string;
  cancelLabel: string;
  isPending: boolean;
  errorMessage: string | undefined;
  confirm: () => void;
}

interface ConfirmShellProps<Payload> extends ConfirmBlockProps<Payload> {
  initialFocus?: DialogFocusTarget;
  children: (step: ConfirmStepProps<Payload>) => ReactNode;
}

interface ConfirmCardProps<Payload> extends Omit<
  ConfirmShellProps<Payload>,
  'trigger' | 'initialFocus' | 'finalFocus'
> {
  payload: Payload;
  cancelLabel: string;
}

function ConfirmCard<Payload>({
  controller,
  payload,
  title,
  description,
  actionLabel,
  cancelLabel,
  children,
}: ConfirmCardProps<Payload>) {
  const { reverification, step } = controller;
  const confirmStep = children({
    payload,
    title: resolve(title, payload),
    description: resolve(description, payload),
    actionLabel: resolve(actionLabel, payload),
    cancelLabel,
    isPending: controller.isPending,
    errorMessage: controller.errorMessage,
    confirm: () => controller.confirm(payload),
  });

  return (
    <Card.Root
      elevation='overlay'
      renderBranding={false}
    >
      {reverification ? (
        <Flow.Root
          value={step}
          direction={step === 'verify' ? 1 : -1}
          state={step}
        >
          {() => (
            <>
              <Flow.Step ids={['confirm']}>{confirmStep}</Flow.Step>
              <Flow.Step ids={['verify']}>
                <Reverification
                  controller={reverification}
                  onClose={() => controller.onOpenChange(false)}
                />
              </Flow.Step>
            </>
          )}
        </Flow.Root>
      ) : (
        confirmStep
      )}
    </Card.Root>
  );
}

/**
 * The dialog around a confirm block: the root on the controller's handle, the popup and card, and
 * the verify step a reverified action swaps in. The block renders the confirm step through
 * `children`.
 */
export function ConfirmShell<Payload>({
  controller,
  trigger,
  initialFocus,
  finalFocus,
  cancelLabel = 'Cancel',
  ...card
}: ConfirmShellProps<Payload>) {
  return (
    <Dialog.Root
      role='alertdialog'
      showCloseButton={controller.step === 'verify' && controller.canClose}
      handle={controller.handle}
      open={controller.isOpen}
      onOpenChange={controller.onOpenChange}
    >
      {({ payload }) => (
        <>
          {trigger ? <Dialog.Trigger render={trigger} /> : null}
          <Dialog.Popup
            variant='card'
            initialFocus={initialFocus}
            finalFocus={finalFocus}
          >
            <ConfirmCard
              {...card}
              controller={controller}
              // The dialog root types its payload as optional because it cannot know how it is opened.
              // Because it's enforced in the controller that this can only open via a function with the
              // same signature/Payload as we expect, it's safe to typecast here. It would be very hard
              // to convince TS of this properly, essentially by copying the Payload into the controller,
              // so we take the easy way in this case. This only holds while the controller upholds the
              // guarantee.
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- See above
              payload={payload as Payload}
              cancelLabel={cancelLabel}
            />
          </Dialog.Popup>
        </>
      )}
    </Dialog.Root>
  );
}
