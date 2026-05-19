import type { ComponentType } from 'react';

import { Button, descriptors, Flex, Icon, Input } from '../customizables';
import { useClipboard } from '../hooks';
import { Clipboard, ShieldCheck } from '../icons';
import type { PropsOfComponent } from '../styledSystem';

type ClipboardInputProps = PropsOfComponent<typeof Input> & {
  copyIcon?: ComponentType;
  copiedIcon?: ComponentType;
};

export const ClipboardInput = (props: ClipboardInputProps) => {
  const { id, value, copyIcon = Clipboard, copiedIcon = ShieldCheck, sx, ...rest } = props;
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
        sx={theme => ({ paddingInlineEnd: theme.space.$7x5, textOverflow: 'ellipsis' })}
      />

      <Button
        elementDescriptor={descriptors.formFieldInputCopyToClipboardButton}
        variant='ghost'
        onClick={() => onCopy()}
        sx={t => {
          return {
            position: 'absolute',
            insetInlineEnd: t.space.$1,
            padding: 0,
            height: t.sizes.$6,
            aspectRatio: 1,
            borderRadius: `calc(${t.radii.$md} - ${t.space.$1})`,
          };
        }}
      >
        <Icon
          elementDescriptor={descriptors.formFieldInputCopyToClipboardIcon}
          icon={hasCopied ? copiedIcon : copyIcon}
        />
      </Button>
    </Flex>
  );
};
