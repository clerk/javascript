import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import type { ConfirmBlockProps } from '../confirm/confirm-shell';
import { ConfirmShell } from '../confirm/confirm-shell';

/** The weight the confirming button carries: an undoable action takes `primary`. */
export type ConfirmationColor = 'negative' | 'primary';

export interface ConfirmationProps<Payload = void> extends ConfirmBlockProps<Payload> {
  /** The weight the confirming button carries. An action that can be undone takes `primary` (default: `negative`) */
  color?: ConfirmationColor;
  disabled?: boolean;
}

/**
 * Confirmation dialog for an action worth a second look but not worth making the user type for.
 * Use `Destructive` for the destructive actions that are. `color` sets the weight the confirming
 * button carries: `negative` for what cannot be undone, `primary` for what can.
 *
 * An alert dialog: an outside press leaves it open, and the confirm step has no corner dismiss. The
 * verify step a reverified action swaps in shows one, except while the action is being retried.
 *
 * Driven by a `useConfirmController`. A dialog that sits next to its button takes it as `trigger`;
 * a dialog shared by a list is opened from each row with `controller.open(payload)`, and the copy
 * is derived from that payload.
 *
 * @example
 * const remove = useConfirmController<Member>({ onConfirm: member => removeMember(member.id) });
 *
 * <Menu.Item color='negative' onClick={() => remove.open(member)}>Remove</Menu.Item>
 *
 * <Confirmation
 *   controller={remove}
 *   title='Remove member'
 *   description={member => <><strong>{member.name}</strong> will be removed from the organization.</>}
 *   actionLabel='Remove'
 * />
 */
export function Confirmation<Payload = void>({ color = 'negative', disabled, ...props }: ConfirmationProps<Payload>) {
  return (
    <ConfirmShell {...props}>
      {({ title, description, actionLabel, cancelLabel, isPending, errorMessage, confirm }) => (
        <>
          <Card.Header>
            <Card.Title>{title}</Card.Title>
            <Card.Description>{description}</Card.Description>
          </Card.Header>
          <Card.Banner
            role='alert'
            color='negative'
          >
            {errorMessage}
          </Card.Banner>
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
              isPending={isPending}
              disabled={disabled && !isPending}
              onClick={confirm}
            >
              {actionLabel}
            </SubmitButton>
          </Card.Footer>
        </>
      )}
    </ConfirmShell>
  );
}
