import { Button, Flex, Icon } from '../../customizables';
import { Actions, UserPreview, UserPreviewProps } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { SwitchArrows } from '../../icons';
import { PropsOfComponent } from '../../styledSystem';

export const SessionActions = (props: PropsOfComponent<typeof Flex>) => {
  return (
    <Actions
      sx={theme => ({
        backgroundColor: theme.colors.$blackAlpha20,
        border: `${theme.borders.$normal} ${theme.colors.$blackAlpha200}`,
        borderRight: 0,
        borderLeft: 0,
      })}
      {...props}
    />
  );
};

type UserPreviewButtonProps = PropsOfComponent<typeof Button> & UserPreviewProps;

export const UserPreviewButton = (props: UserPreviewButtonProps) => {
  const card = useCardState();
  const { user, ...rest } = props;
  return (
    <Button
      variant='ghost'
      colorScheme='neutral'
      focusRing={false}
      hoverAsFocus
      isDisabled={card.isLoading}
      {...rest}
      sx={[
        theme => ({
          height: theme.sizes.$14,
          borderRadius: 0,
          justifyContent: 'space-between',
          padding: `${theme.space.$3} ${theme.space.$6}`,
          ':hover > svg': {
            visibility: 'initial',
          },
        }),
        rest.sx,
      ]}
    >
      <UserPreview
        user={user}
        size='sm'
        avatarSx={t => ({ margin: `0 calc(${t.space.$3}/2)` })}
      />

      <Icon
        icon={SwitchArrows}
        sx={t => ({ color: t.colors.$blackAlpha500, marginLeft: t.space.$2, visibility: 'hidden' })}
      />
    </Button>
  );
};
