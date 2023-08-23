import { descriptors, Icon } from '../customizables';
import { ArrowBlockButton } from '../elements';
import { Plus } from '../icons';
import type { PropsOfComponent } from '../styledSystem';

type BlockButtonProps = PropsOfComponent<typeof ArrowBlockButton>;

export const BlockButton = (props: BlockButtonProps) => {
  const { id, ...rest } = props;
  return (
    <ArrowBlockButton
      variant='ghost'
      elementDescriptor={descriptors.profileSectionPrimaryButton}
      elementId={descriptors.profileSectionPrimaryButton?.setId(id as any)}
      {...rest}
    />
  );
};

export const AddBlockButton = (props: BlockButtonProps) => {
  const { leftIcon, ...rest } = props;
  return (
    <BlockButton
      colorScheme='primary'
      {...rest}
      sx={theme => ({ justifyContent: 'flex-start', gap: theme.space.$2 })}
      leftIcon={
        <Icon
          icon={leftIcon || Plus}
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
