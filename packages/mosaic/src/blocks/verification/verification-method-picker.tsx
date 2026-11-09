import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { useFlowAutoFocus } from '../../components/flow';
import type { IconProps } from '../../components/icon';
import { Icon, IconFrame } from '../../components/icon';
import { Item } from '../../components/item';
import { Spinner } from '../../components/spinner';
import { Text } from '../../components/text';
import { ChevronRight } from '../../icons/glyphs/chevron-right';
import { rtl } from '../../styles/rtl.styles';
import { styles } from './verification.styles';

interface VerificationMethod {
  id: string;
  label: string;
  description?: string;
  icon: IconProps['glyph'];
}

export interface VerificationMethodPickerMessages {
  title: string;
  description: string;
  backButton: string;
  helpText: string;
  helpButton: string;
}

interface VerificationMethodPickerProps {
  messages: VerificationMethodPickerMessages;
  methods: readonly VerificationMethod[];
  pendingMethodId?: string;
  onSelect: (methodId: string) => void;
  onHelp: () => void;
  onBack?: () => void;
  focusRef?: Ref<HTMLElement>;
}

export function VerificationMethodPicker({
  messages,
  methods,
  pendingMethodId,
  onSelect,
  onHelp,
  onBack,
  focusRef,
}: VerificationMethodPickerProps) {
  const firstMethodRef = useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLDivElement>()]);

  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
      </Card.Header>
      <Card.Content>
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
              color='neutral'
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
            color='neutral'
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
