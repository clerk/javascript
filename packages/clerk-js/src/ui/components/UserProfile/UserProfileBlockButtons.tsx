import { descriptors, Icon } from '../../customizables';
import { ArrowBlockButton } from '../../elements';
import { Plus } from '../../icons';
import type { PropsOfComponent } from '../../styledSystem';

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
  const { id, leftIcon, ...rest } = props;
  return (
    <BlockButton
      elementDescriptor={descriptors.profileSectionPrimaryButton}
      elementId={descriptors.profileSectionPrimaryButton?.setId(id as any)}
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
