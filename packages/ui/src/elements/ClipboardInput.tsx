import type { ComponentType } from 'react';

import { Button, descriptors, Flex, Icon, Input } from '../customizables';
import { useClipboard } from '../hooks';
import { Clipboard, TickShield } from '../icons';
import type { PropsOfComponent } from '../styledSystem';

type ClipboardInputProps = PropsOfComponent<typeof Input> & {
  copyIcon?: ComponentType;
  copiedIcon?: ComponentType;
};

export const ClipboardInput = (props: ClipboardInputProps) => {
  const { id, value, copyIcon = Clipboard, copiedIcon = TickShield, sx, ...rest } = props;
  const { onCopy, hasCopied } = useClipboard(value as string);

  return (
    <Flex
      direction='col'
      justify='center'
      sx={[{ position: 'relative' }, sx]}
    >
      <Input
        {...rest}
        value={value}
        readOnly
        sx={theme => ({ paddingInlineEnd: theme.space.$10, textOverflow: 'ellipsis' })}
      />

      <Button
        elementDescriptor={descriptors.formFieldInputCopyToClipboardButton}
        variant='ghost'
        onClick={() => onCopy()}
        sx={t => {
          return {
            position: 'absolute',
            insetInlineEnd: t.space.$0x5,
          };
        }}
      >
        <Icon
          elementDescriptor={descriptors.formFieldInputCopyToClipboardIcon}
          icon={hasCopied ? copiedIcon : copyIcon}
          size='sm'
        />
      </Button>
    </Flex>
  );
};
