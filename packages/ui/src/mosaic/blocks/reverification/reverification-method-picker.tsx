import { Button } from '../../components/button';
import { Card } from '../../components/card';
import type { IconProps } from '../../components/icon';
import { Icon } from '../../components/icon';
import { Item } from '../../components/item';
import { Spinner } from '../../components/spinner';
import { Text } from '../../components/text';

export interface ReverificationMethod {
  id: string;
  label: string;
  description?: string;
  icon?: IconProps['name'];
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
}

export function ReverificationMethodPicker({
  messages,
  methods,
  pendingMethodId,
  onSelect,
  onHelp,
  onBack,
}: ReverificationMethodPickerProps) {
  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
      </Card.Header>
      <Card.Content>
        <Item.Group>
          {methods.map(method => {
            const isPending = pendingMethodId === method.id;
            return (
              <Item.Root
                key={method.id}
                render={
                  <button
                    type='button'
                    disabled={Boolean(pendingMethodId)}
                    onClick={() => onSelect(method.id)}
                  />
                }
              >
                {method.icon ? (
                  <Item.Media>
                    <Icon name={method.icon} />
                  </Item.Media>
                ) : null}
                <Item.Content>
                  <Item.Label>{method.label}</Item.Label>
                  {method.description ? <Item.Description>{method.description}</Item.Description> : null}
                </Item.Content>
                <Item.Actions>{isPending ? <Spinner size='sm' /> : <Icon name='chevron-right' />}</Item.Actions>
              </Item.Root>
            );
          })}
        </Item.Group>
        {onBack ? (
          <Button
            type='button'
            variant='ghost'
            fullWidth
            onClick={onBack}
          >
            {messages.backButton}
          </Button>
        ) : null}
      </Card.Content>
      <Card.Footer>
        <Text
          size='xs'
          color='neutral'
        >
          {messages.helpText}
        </Text>
        <Button
          type='button'
          size='sm'
          variant='link'
          onClick={onHelp}
        >
          {messages.helpButton}
        </Button>
      </Card.Footer>
    </>
  );
}
