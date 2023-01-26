import { Button, Icon } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { useCardState } from './contexts';

type PreviewButtonProps = Omit<PropsOfComponent<typeof Button>, 'icon'> & {
  icon?: React.ComponentType;
};

export const PreviewButton = (props: PreviewButtonProps) => {
  const { sx, children, icon, ...rest } = props;
  const card = useCardState();

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
          ':hover > svg': {
            visibility: 'initial',
          },
        }),
        sx,
      ]}
      {...rest}
    >
      {children}
      {icon && (
        <Icon
          icon={icon}
          sx={t => ({ color: t.colors.$blackAlpha500, marginLeft: t.space.$2, visibility: 'hidden' })}
        />
      )}
    </Button>
  );
};
