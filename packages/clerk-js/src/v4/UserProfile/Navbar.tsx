import { Button, Col, Icon } from '../customizables';
import { TickShield, User } from '../icons';
import { PropsOfComponent } from '../styledSystem';

export const NavBar = () => {
  return (
    <Col
      gap={2}
      sx={theme => ({
        flexBasis: theme.space.$60,
        borderRight: `${theme.borders.$normal} ${theme.colors.$blackAlpha300}`,
        // TODO: These margins need to be equal to the cards paddings.
        //  Is there a better way to handle this?
        marginTop: `-${theme.space.$9x5}`,
        marginBottom: `-${theme.space.$12}`,
        marginLeft: `-${theme.space.$8}`,
        padding: `${theme.space.$9x5} ${theme.space.$6}`,
      })}
    >
      <NavButton
        icon={User}
        active
      >
        Account
      </NavButton>
      <NavButton icon={TickShield}>Security</NavButton>
    </Col>
  );
};

type NavButtonProps = PropsOfComponent<typeof Button> & {
  icon: React.ComponentType;
  active?: boolean;
};

const NavButton = (props: NavButtonProps) => {
  const { icon, children, active, ...rest } = props;
  return (
    <Button
      variant='ghost'
      colorScheme='neutral'
      textVariant={'regularMedium'}
      {...rest}
      sx={theme => ({
        gap: theme.space.$4,
        justifyContent: 'flex-start',
        backgroundColor: active ? theme.colors.$blackAlpha50 : undefined,
        opacity: active ? 1 : 0.6,
      })}
    >
      <Icon
        icon={icon}
        sx={{ opacity: active ? 1 : 0.7 }}
      />
      {children}
    </Button>
  );
};
