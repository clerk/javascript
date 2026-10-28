import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { useFlowAutoFocus } from '../../../components/flow';
import type { IconProps } from '../../../components/icon';
import { Icon, IconFrame } from '../../../components/icon';
import { Item } from '../../../components/item';
import { Spinner } from '../../../components/spinner';
import { Text } from '../../../components/text';
import { ChevronRight } from '../../../icons/glyphs/chevron-right';
import { rtl } from '../../../styles/rtl.styles';

const styles = stylex.create({
  helpText: {
    textAlign: 'center',
  },
});

export interface ReverificationMethod {
  id: string;
  label: string;
  description?: string;
  icon: IconProps['glyph'];
}

export interface ReverificationMethodPickerMessages {
  title: string;
  description: string;
  backButton: string;
  helpText: string;
  helpButton: string;
}

export interface ReverificationMethodPickerProps {
  messages: ReverificationMethodPickerMessages;
  methods: readonly ReverificationMethod[];
  pendingMethodId?: string;
  onSelect: (methodId: string) => void;
  onHelp: () => void;
  onBack?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function ReverificationMethodPicker({
  messages,
  methods,
  pendingMethodId,
  onSelect,
  onHelp,
  onBack,
  focusRef,
}: ReverificationMethodPickerProps) {
  const firstMethodRef = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLDivElement>()]);

  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
      </Card.Header>
      <Card.Content>
        <Item.Group variant='outline'>
          {methods.map((method, index) => {
            const isPending = pendingMethodId === method.id;
            return (
              <Item.Root
                key={method.id}
                ref={index === 0 ? firstMethodRef : undefined}
                size='lg'
                render={
                  <button
                    type='button'
                    disabled={Boolean(pendingMethodId)}
                    onClick={() => onSelect(method.id)}
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
                    <Spinner size='sm' />
                  ) : (
                    <Icon
                      glyph={ChevronRight}
                      xstyle={rtl.mirror}
                    />
                  )}
                </Item.Actions>
              </Item.Root>
            );
          })}
          {onBack ? (
            <Button
              type='button'
              variant='ghost'
              disabled={Boolean(pendingMethodId)}
              onClick={onBack}
            >
              {messages.backButton}
            </Button>
          ) : null}
        </Item.Group>
        <Text
          size='xs'
          xstyle={styles.helpText}
        >
          {messages.helpText}{' '}
          <Button
            type='button'
            size='sm'
            variant='link'
            disabled={Boolean(pendingMethodId)}
            onClick={() => {
              if (!pendingMethodId) {
                onHelp();
              }
            }}
          >
            {messages.helpButton}
          </Button>
        </Text>
      </Card.Content>
    </>
  );
}
