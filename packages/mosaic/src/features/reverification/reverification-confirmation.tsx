import {
  Confirmation,
  type ConfirmationControlledProps,
  type ConfirmationHandleProps,
} from '../../blocks/confirmation';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Reverification } from './reverification';
import type { ReverificationController } from './reverification.controller';

type ReverificationConfirmationProps<Payload> = (
  | Omit<ConfirmationControlledProps, 'step' | 'verificationSlot'>
  | Omit<ConfirmationHandleProps<Payload>, 'step' | 'verificationSlot' | 'onPendingCancel'>
) & {
  reverification?: ReverificationController;
  backLabel?: string;
};

export function ReverificationConfirmation<Payload>({
  reverification,
  backLabel = 'Back',
  ...props
}: ReverificationConfirmationProps<Payload>) {
  const step =
    reverification && reverification.status !== 'idle' && reverification.status !== 'loading' ? 'verify' : 'confirm';
  const verificationSlot = reverification ? (
    <>
      <Reverification {...reverification} />
      <Card.Footer>
        <Button
          variant='outline'
          color='neutral'
          fullWidth
          disabled={!reverification.onCancel}
          onClick={reverification.onCancel}
        >
          {backLabel}
        </Button>
      </Card.Footer>
    </>
  ) : undefined;

  if ('handle' in props) {
    return (
      <Confirmation
        {...props}
        step={step}
        verificationSlot={verificationSlot}
        onPendingCancel={reverification?.onCancel}
      />
    );
  }

  return (
    <Confirmation
      {...props}
      step={step}
      verificationSlot={verificationSlot}
      onOpenChange={(open, details) => {
        if (!open && reverification && reverification.status !== 'idle') {
          reverification.onCancel?.();
          return;
        }
        props.onOpenChange(open, details);
      }}
    />
  );
}
