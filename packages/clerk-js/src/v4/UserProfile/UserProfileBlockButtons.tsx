import { Icon } from '../customizables';
import { ArrowBlockButton } from '../elements';
import { Plus } from '../icons';
import { PropsOfComponent } from '../styledSystem';

type BlockButtonProps = PropsOfComponent<typeof ArrowBlockButton>;

export const BlockButton = (props: BlockButtonProps) => {
  return (
    <ArrowBlockButton
      variant='ghost'
      {...props}
    />
  );
};

export const AddBlockButton = (props: BlockButtonProps) => {
  return (
    <BlockButton
      colorScheme='primary'
      {...props}
      sx={theme => ({ justifyContent: 'flex-start', gap: theme.space.$2 })}
      icon={
        <Icon
          icon={Plus}
          sx={theme => ({
            width: theme.sizes.$2x5,
            height: theme.sizes.$2x5,
          })}
        />
      }
    >
      {props.children}
    </BlockButton>
  );
};
