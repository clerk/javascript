import { Button, Icon } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { useCardState } from './contexts';

type PreviewButtonProps = Omit<PropsOfComponent<typeof Button>, 'icon'> & {
  icon?: React.ComponentType;
  iconProps?: Omit<PropsOfComponent<typeof Icon>, 'icon'>;
  showIconOnHover?: boolean;
};

export const PreviewButton = (props: PreviewButtonProps) => {
  const { sx, children, icon, iconProps, showIconOnHover = true, ...rest } = props;
  const card = useCardState();

  const { sx: iconSx, ...restIconProps } = iconProps || {};

  return (
    <Button
      variant='ghost'
      colorScheme='neutral'
      focusRing={false}
      block
      hoverAsFocus
      isDisabled={card.isLoading}
      sx={[
        t => ({
          minHeight: 'unset',
          height: t.space.$12,
          justifyContent: 'space-between',
          padding: `${t.space.$3} ${t.space.$6}`,
          ...(showIconOnHover
            ? {
                ':hover > svg': {
                  visibility: 'initial',
                },
              }
            : {}),
        }),
        sx,
      ]}
      {...rest}
    >
      {children}
      {icon && (
        <Icon
          icon={icon}
          sx={[
            t => ({
              color: t.colors.$blackAlpha500,
              marginLeft: t.space.$2,
              visibility: showIconOnHover ? 'hidden' : 'initial',
            }),
            iconSx,
          ]}
          {...restIconProps}
        />
      )}
    </Button>
  );
};
