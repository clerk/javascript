import { useId } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { Heading } from '../../components/heading';
import { Text } from '../../components/text';
import type {
  ReverificationChooseProps,
  ReverificationMessageProps,
  ReverificationVerifyProps,
} from './reverification';
import { Reverification } from './reverification';

export interface ReverificationDialogAction {
  label: string;
  onClick: () => void;
}

export interface ReverificationDialogHelp {
  text: string;
  action: ReverificationDialogAction;
}

interface ReverificationDialogContentBaseProps {
  dismissible: boolean;
  title: string;
  description: string;
  closeLabel: string;
}

export type ReverificationDialogChooseProps = ReverificationChooseProps &
  ReverificationDialogContentBaseProps & {
    back?: ReverificationDialogAction;
    help: ReverificationDialogHelp;
  };

export type ReverificationDialogVerifyProps = ReverificationVerifyProps &
  ReverificationDialogContentBaseProps & {
    submitLabel: string;
    pendingLabel: string;
    cancelLabel: string;
    alternative?: ReverificationDialogAction;
    help?: ReverificationDialogHelp;
  };

export type ReverificationDialogMessageProps = ReverificationMessageProps &
  ReverificationDialogContentBaseProps & {
    action: ReverificationDialogAction;
    secondary?: ReverificationDialogAction;
  };

export type ReverificationDialogContentProps =
  | ReverificationDialogChooseProps
  | ReverificationDialogVerifyProps
  | ReverificationDialogMessageProps;

export function ReverificationDialogContent(props: ReverificationDialogContentProps) {
  const { dismissible, title, description, closeLabel } = props;
  const formId = useId();

  return (
    <>
      {dismissible ? <Dialog.CloseButton aria-label={closeLabel} /> : null}
      <Card.Header>
        <Dialog.Title render={<Heading size='sm' />}>{title}</Dialog.Title>
        <Dialog.Description render={<Text />}>{description}</Dialog.Description>
      </Card.Header>
      <Card.Content>
        <Reverification
          {...props}
          formId={formId}
        />
        <ContentAction {...props} />
      </Card.Content>
      <Actions
        {...props}
        formId={formId}
      />
    </>
  );
}

function ContentAction(props: ReverificationDialogContentProps) {
  const action = props.step === 'choose' ? props.back : props.step === 'verify' ? props.alternative : undefined;

  return action ? (
    <Button
      color='neutral'
      variant='ghost'
      onClick={action.onClick}
    >
      {action.label}
    </Button>
  ) : null;
}

function HelpFooter({ text, action }: ReverificationDialogHelp) {
  return (
    <Card.Footer style={{ justifyContent: 'center' }}>
      <Text>{text}</Text>
      <Button
        color='neutral'
        variant='ghost'
        onClick={action.onClick}
      >
        {action.label}
      </Button>
    </Card.Footer>
  );
}

function Actions(props: ReverificationDialogContentProps & { formId: string }) {
  switch (props.step) {
    case 'choose':
      return <HelpFooter {...props.help} />;
    case 'verify':
      return (
        <>
          {props.help ? <HelpFooter {...props.help} /> : null}
          <Card.Footer>
            <Dialog.Close
              render={
                <Button
                  color='neutral'
                  disabled={!props.dismissible}
                  fullWidth
                  variant='outline'
                />
              }
            >
              {props.cancelLabel}
            </Dialog.Close>
            <SubmitButton
              color='primary'
              form={props.formId}
              fullWidth
              isPending={props.isPending}
              pendingLabel={props.pendingLabel}
              disabled={!props.canSubmit}
              focusableWhenDisabled
              variant='filled'
            >
              {props.submitLabel}
            </SubmitButton>
          </Card.Footer>
        </>
      );
    case 'message':
      return (
        <Card.Footer>
          <Button
            color='primary'
            fullWidth
            variant='filled'
            onClick={props.action.onClick}
          >
            {props.action.label}
          </Button>
          {props.secondary ? (
            <Button
              color='neutral'
              fullWidth
              variant='outline'
              onClick={props.secondary.onClick}
            >
              {props.secondary.label}
            </Button>
          ) : null}
        </Card.Footer>
      );
  }
}
