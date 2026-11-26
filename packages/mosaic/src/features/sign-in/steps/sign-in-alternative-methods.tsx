import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Prompt } from '../../../blocks/prompt';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Icon, IconFrame } from '../../../components/icon';
import { Item } from '../../../components/item';
import { Spinner } from '../../../components/spinner';
import type { IconComponent } from '../../../icons/glyph';
import { ChevronRight } from '../../../icons/glyphs/chevron-right';
import { useMessages } from '../../../localization';
import { useFlowAutoFocus } from '../../../primitives/flow/flow-step-context';
import { ghostAction } from '../../../styles/ghost-action.styles';
import { optical } from '../../../styles/optical.styles';
import { rtl } from '../../../styles/rtl.styles';
import { styles } from '../sign-in.styles';

interface SignInMethodOption {
  id: string;
  label: string;
  description?: string;
  icon: IconComponent;
}

interface SignInAlternativeMethodsProps {
  title: string;
  description: string;
  methods: readonly SignInMethodOption[];
  pendingMethodId?: string;
  onSelectMethod: (id: string) => void;
  isDisabled: boolean;
  globalErrorMessage?: string;
  onBack?: () => void;
  onShowHelp: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function SignInAlternativeMethods({
  title,
  description,
  methods,
  pendingMethodId,
  onSelectMethod,
  isDisabled,
  globalErrorMessage,
  onBack,
  onShowHelp,
  focusRef,
}: SignInAlternativeMethodsProps) {
  const m = useMessages('signIn');
  const firstMethodRef = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLButtonElement>()]);

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
          <Item.Group>
            {methods.map((method, index) => {
              const isPending = pendingMethodId === method.id;
              return (
                <Item.Root
                  key={method.id}
                  ref={index === 0 ? firstMethodRef : undefined}
                  render={
                    <button
                      type='button'
                      disabled={isDisabled}
                      aria-busy={isPending}
                      onClick={() => onSelectMethod(method.id)}
                    />
                  }
                >
                  <Item.Media>
                    <IconFrame
                      filled
                      bordered={false}
                    >
                      <Icon glyph={method.icon} />
                    </IconFrame>
                  </Item.Media>
                  <Item.Content>
                    <Item.Label>{method.label}</Item.Label>
                    {method.description ? <Item.Description>{method.description}</Item.Description> : null}
                  </Item.Content>
                  <Item.Actions>
                    {isPending ? (
                      <Spinner
                        size='sm'
                        label={m.verifying}
                      />
                    ) : (
                      <Icon
                        glyph={ChevronRight}
                        xstyle={[rtl.mirror, optical.trailingChevron]}
                      />
                    )}
                  </Item.Actions>
                </Item.Root>
              );
            })}
          </Item.Group>
          <Prompt
            text={m.alternativeMethods.helpPrompt}
            action={m.alternativeMethods.helpLink}
            disabled={isDisabled}
            onAction={onShowHelp}
          />
        </div>
        <div {...stylex.props(styles.buttonStack)}>
          {onBack ? (
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
          ) : null}
        </div>
      </Card.Content>
    </>
  );
}
