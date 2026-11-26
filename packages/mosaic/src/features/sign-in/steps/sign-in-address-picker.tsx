import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Item } from '../../../components/item';
import { Spinner } from '../../../components/spinner';
import { useMessages } from '../../../localization';
import { useFlowAutoFocus } from '../../../primitives/flow/flow-step-context';
import { ghostAction } from '../../../styles/ghost-action.styles';
import { styles } from '../sign-in.styles';
import type { SignInFactor } from '../sign-in.types';
import { factorIdentifier } from '../sign-in.utils';

interface SignInAddressPickerProps {
  title: string;
  description: string;
  options: readonly SignInFactor[];
  pendingFactorId?: string;
  onSelectFactor: (id: string) => void;
  isDisabled: boolean;
  globalErrorMessage?: string;
  onBack: () => void;
  focusRef?: Ref<HTMLElement>;
}

function isPrimary(option: SignInFactor): boolean {
  return 'primary' in option && Boolean(option.primary);
}

export function SignInAddressPicker({
  title,
  description,
  options,
  pendingFactorId,
  onSelectFactor,
  isDisabled,
  globalErrorMessage,
  onBack,
  focusRef,
}: SignInAddressPickerProps) {
  const m = useMessages('signIn');
  const firstRef = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);
  const ordered = [...options].sort((a, b) => Number(isPrimary(b)) - Number(isPrimary(a)));

  return (
    <>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        <div {...stylex.props(styles.buttonStack)}>
          {ordered.map((option, index) => {
            const pending = pendingFactorId === option.id;
            return (
              <Item.Root
                key={option.id}
                ref={index === 0 ? firstRef : undefined}
                render={
                  <button
                    type='button'
                    disabled={isDisabled}
                    aria-busy={pending}
                    onClick={() => onSelectFactor(option.id)}
                  />
                }
              >
                <Item.Content>
                  <Item.Label>
                    <span {...stylex.props(styles.addressLabel)}>
                      {factorIdentifier(option)}
                      {isPrimary(option) ? <Badge color='neutral'>{m.addresses.primary}</Badge> : null}
                    </span>
                  </Item.Label>
                </Item.Content>
                {pending ? (
                  <Item.Actions>
                    <Spinner
                      size='sm'
                      label={m.verifying}
                    />
                  </Item.Actions>
                ) : null}
              </Item.Root>
            );
          })}
        </div>
        <div {...stylex.props(styles.buttonStack)}>
          <Button
            type='button'
            color='neutral'
            variant='ghost'
            fullWidth
            disabled={isDisabled}
            xstyle={ghostAction.trailing}
            onClick={onBack}
          >
            {m.alternativeMethods.back}
          </Button>
        </div>
      </Card.Content>
    </>
  );
}
