import type { AnyActor } from '../../machine/types';
import { useChildSnapshot, useMachine } from '../../machine/useMachine';
import type { DestructiveControlledProps } from './destructive';
import { type DestructiveActors, destructiveMachine } from './destructive.machine';

export type DestructiveController = Pick<
  DestructiveControlledProps,
  'open' | 'isDeleting' | 'errorMessage' | 'onOpenChange' | 'step'
> & {
  onDelete: () => void;
  openDestructiveDialog: () => void;
  action: AnyActor | undefined;
};

export function useDestructiveController({
  onDelete,
}: {
  onDelete: DestructiveActors['action'];
}): DestructiveController {
  const [snapshot, send] = useMachine(destructiveMachine, { actors: { action: onDelete } });
  const action = snapshot.children.action;
  const actionSnapshot = useChildSnapshot(action);
  const cancellable = actionSnapshot?.hasTag('cancellable') ?? false;

  return {
    open: snapshot.matches('open'),
    isDeleting: snapshot.matches('open.running') && !cancellable,
    errorMessage: snapshot.matches('open.failed') ? snapshot.context.errorMessage : undefined,
    step: actionSnapshot?.hasTag('interactive') ? 'verify' : 'confirm',
    action,
    openDestructiveDialog: () => send({ type: 'OPEN' }),
    onDelete: () => send({ type: 'CONFIRM' }),
    onOpenChange: nextIsOpen => send(nextIsOpen ? { type: 'OPEN' } : { type: 'CLOSE' }),
  };
}
