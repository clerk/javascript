import { Flex, Icon } from '../customizables';
import type { ElementDescriptor } from '../customizables/elementDescriptors';
import type { PropsOfComponent } from '../styledSystem';

type IconCircleProps = Pick<PropsOfComponent<typeof Icon>, 'icon'> &
  PropsOfComponent<typeof Flex> & {
    boxElementDescriptor?: ElementDescriptor;
    iconElementDescriptor?: ElementDescriptor;
  };

export const IconCircle = (props: IconCircleProps) => {
  const { icon, boxElementDescriptor, iconElementDescriptor, sx, ...rest } = props;

  return (
    <Flex
      center
      elementDescriptor={boxElementDescriptor}
      sx={[
        t => ({
          backgroundColor: t.colors.$neutralAlpha50,
          width: t.sizes.$16,
          height: t.sizes.$16,
          borderRadius: t.radii.$circle,
        }),
        sx,
      ]}
      {...rest}
    >
      <Icon
        elementDescriptor={iconElementDescriptor}
        icon={icon}
        size='lg'
        sx={theme => ({ color: theme.colors.$neutralAlpha600 })}
      />
    </Flex>
  );
};
