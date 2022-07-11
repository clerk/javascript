import React from 'react';

import { Button, Col, descriptors, Icon } from '../customizables';
import { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { usePopover } from '../hooks';
import { Menu, TickShield, User } from '../icons';
import { animations, mqu, PropsOfComponent } from '../styledSystem';
import { colors, createContextAndHook } from '../utils';

type NavbarContextValue = { isOpen: boolean; open: () => void; close: () => void };
export const [NavbarContext, useNavbarContext] = createContextAndHook<NavbarContextValue>('NavbarContext');
export const NavbarContextProvider = (props: React.PropsWithChildren<{}>) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const value = React.useMemo(() => ({ value: { isOpen, open, close } }), [isOpen]);
  return <NavbarContext.Provider value={value}>{props.children}</NavbarContext.Provider>;
};

export const BaseRoutes = [
  // Order matters, will match first
  { name: 'Security', icon: TickShield, path: '/security' },
  { name: 'Account', icon: User, path: '/' },
];

type NavBarProps = {
  contentRef: React.RefObject<HTMLDivElement>;
};

export const NavBar = (props: NavBarProps) => {
  const { contentRef } = props;

  const scroll = (id: string) => {
    if (contentRef.current) {
      const el = contentRef.current.querySelector('#' + id);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Col
        elementDescriptor={descriptors.navbarSection}
        sx={theme => ({
          flex: `0 0 ${theme.space.$60}`,
          borderRight: `${theme.borders.$normal} ${theme.colors.$blackAlpha300}`,
          padding: `${theme.space.$9x5} ${theme.space.$6}`,
          [mqu.md]: {
            display: 'none',
          },
        })}
      >
        <Col
          elementDescriptor={descriptors.navbar}
          gap={2}
        >
          <NavButton
            elementDescriptor={descriptors.navbarItem}
            elementId={descriptors.navbarItem.setId('account')}
            iconElementDescriptor={descriptors.navbarIcon}
            iconElementId={descriptors.navbarIcon.setId('account')}
            onClick={() => scroll('cl-userProfile-section-account')}
            icon={User}
            isActive
          >
            Account
          </NavButton>
          <NavButton
            elementDescriptor={descriptors.navbarItem}
            elementId={descriptors.navbarItem.setId('security')}
            iconElementDescriptor={descriptors.navbarIcon}
            iconElementId={descriptors.navbarIcon.setId('security')}
            icon={TickShield}
            onClick={() => scroll('cl-userProfile-section-security')}
          >
            Security
          </NavButton>
        </Col>
      </Col>
      <MobileNavbar />
    </>
  );
};

const MobileNavbar = () => {
  const navbarContext = useNavbarContext();
  const { floating, isOpen, open, close } = usePopover({ defaultOpen: false, autoUpdate: false });

  React.useEffect(() => {
    console.log(isOpen);
    if (navbarContext.isOpen) {
      open();
    } else {
      close();
    }
  }, [navbarContext.isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      navbarContext.close();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <Col
      sx={t => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%',
        zIndex: t.zIndices.$navbar,
        borderRadius: t.radii.$xl,
        overflow: 'hidden',
      })}
    >
      <Col
        ref={floating}
        elementDescriptor={descriptors.navbarSection}
        sx={t => ({
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: t.space.$60,
          backgroundColor: colors.makeSolid(t.colors.$colorBackground),
          borderTopRightRadius: t.radii.$lg,
          borderBottomRightRadius: t.radii.$lg,
          borderRight: `${t.borders.$normal} ${t.colors.$blackAlpha100}`,
          padding: `${t.space.$9x5} ${t.space.$6}`,
          animation: `${animations.navbarSlideIn} ${t.transitionDuration.$slower} ${t.transitionTiming.$slowBezier}`,
          boxShadow: t.shadows.$cardDropShadow,
        })}
      >
        <Col
          elementDescriptor={descriptors.navbar}
          gap={2}
        >
          <NavButton
            elementDescriptor={descriptors.navbarItem}
            elementId={descriptors.navbarItem.setId('account')}
            iconElementDescriptor={descriptors.navbarIcon}
            iconElementId={descriptors.navbarIcon.setId('account')}
            icon={User}
            isActive
          >
            Account
          </NavButton>
          <NavButton
            elementDescriptor={descriptors.navbarItem}
            elementId={descriptors.navbarItem.setId('security')}
            iconElementDescriptor={descriptors.navbarIcon}
            iconElementId={descriptors.navbarIcon.setId('security')}
            icon={TickShield}
          >
            Security
          </NavButton>
        </Col>
      </Col>
    </Col>
  );
};

type NavButtonProps = PropsOfComponent<typeof Button> & {
  icon: React.ComponentType;
  iconElementDescriptor: ElementDescriptor;
  iconElementId: ElementId;
  isActive?: boolean;
};

const NavButton = (props: NavButtonProps) => {
  const { icon, children, isActive, contentEditable, iconElementDescriptor, iconElementId, ...rest } = props;
  return (
    <Button
      variant='ghost'
      colorScheme='neutral'
      textVariant='regularMedium'
      isActive={isActive}
      {...rest}
      sx={theme => ({
        gap: theme.space.$4,
        justifyContent: 'flex-start',
        backgroundColor: isActive ? theme.colors.$blackAlpha50 : undefined,
        opacity: isActive ? 1 : 0.6,
      })}
    >
      <Icon
        elementDescriptor={iconElementDescriptor}
        elementId={iconElementId}
        icon={icon}
        sx={{ opacity: isActive ? 1 : 0.7 }}
      />
      {children}
    </Button>
  );
};

export const NavbarMenuButtonRow = (props: PropsOfComponent<typeof Button>) => {
  const { open } = useNavbarContext();
  return (
    <Col
      sx={{
        display: 'none',
        [mqu.md]: {
          display: 'flex',
        },
      }}
    >
      <Button
        {...props}
        onClick={open}
        size='xs'
        variant='ghost'
        colorScheme='neutral'
        sx={t => ({
          color: t.colors.$colorText,
          gap: t.space.$1x5,
          width: 'fit-content',
          alignItems: 'center',
        })}
      >
        <Icon
          icon={Menu}
          size='sm'
        />
        Menu
      </Button>
    </Col>
  );
};
