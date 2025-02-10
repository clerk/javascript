import { Button, descriptors, Flex, Icon, Input } from '../customizables';
import { useClipboard } from '../hooks';
import { Clipboard, TickShield } from '../icons';
import type { PropsOfComponent } from '../styledSystem';

export const ClipboardInput = (props: PropsOfComponent<typeof Input>) => {
  const { id, value, ...rest } = props;
  const { onCopy, hasCopied } = useClipboard(value as string);

  return (
    <Flex
      direction='col'
      justify='center'
      sx={{ position: 'relative' }}
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
        tabIndex={-1}
        onClick={onCopy}
        sx={{
          position: 'absolute',
          right: 0,
        }}
      >
        <Icon
          elementDescriptor={descriptors.formFieldInputCopyToClipboardIcon}
          icon={hasCopied ? TickShield : Clipboard}
          size='sm'
        />
      </Button>
    </Flex>
  );
};
