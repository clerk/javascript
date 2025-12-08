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
        isDisabled
        sx={theme => ({ paddingRight: theme.space.$8 })}
      />

      <Button
        elementDescriptor={descriptors.formFieldInputCopyToClipboardButton}
        variant='ghost'
        onClick={onCopy}
        sx={{
          position: 'absolute',
          right: 0,
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
