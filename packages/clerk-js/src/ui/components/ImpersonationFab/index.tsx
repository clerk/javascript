import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { SignedInSessionResource } from '@clerk/shared/types';
import type { PointerEventHandler } from 'react';
import React, { useEffect, useRef } from 'react';

import { getFullName, getIdentifier } from '../../../utils/user';
import { useSignOutContext, withCoreUserGuard } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import {
  Col,
  descriptors,
  Flex,
  Icon,
  Link,
  localizationKeys,
  Text,
  useAppearance,
  useLocalizations,
} from '../../customizables';
import { Portal } from '../../elements/Portal';
import { useMultipleSessions } from '../../hooks/useMultipleSessions';
import { Eye } from '../../icons';
import type { PropsOfComponent } from '../../styledSystem';
import { InternalThemeProvider, mqu } from '../../styledSystem';

type EyeCircleProps = PropsOfComponent<typeof Col> & {
  width: string;
  height: string;
};

const EyeCircle = ({ width, height, ...props }: EyeCircleProps) => {
  const { sx, ...rest } = props;
  return (
    <Col
      elementDescriptor={descriptors.impersonationFabIconContainer}
      center
      sx={[
        t => ({
          width,
          height,
          backgroundColor: t.colors.$danger500,
          borderRadius: t.radii.$circle,
        }),
        sx,
      ]}
      {...rest}
    >
      <Icon
        elementDescriptor={descriptors.impersonationFabIcon}
        icon={Eye}
        sx={t => ({
          color: t.colors.$white,
        })}
        size={'lg'}
      />
    </Col>
  );
};

type FabContentProps = { title: LocalizationKey; signOutText: LocalizationKey };

const FabContent = ({ title, signOutText }: FabContentProps) => {
  const { session } = useSession();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { otherSessions } = useMultipleSessions({ user });
  const { navigateAfterSignOut, navigateAfterMultiSessionSingleSignOutUrl } = useSignOutContext();

  const handleSignOutSessionClicked = (session: SignedInSessionResource) => () => {
    if (otherSessions.length === 0) {
      return signOut(navigateAfterSignOut);
    }
    return signOut(navigateAfterMultiSessionSingleSignOutUrl, { sessionId: session.id });
  };

  return (
    <Col
      sx={t => ({
        width: '100%',
        paddingLeft: t.sizes.$4,
        paddingRight: t.sizes.$6,
        whiteSpace: 'nowrap',
      })}
    >
      <Text
        colorScheme='secondary'
        elementDescriptor={descriptors.impersonationFabTitle}
        variant='buttonLarge'
        truncate
        localizationKey={title}
      />
      <Link
        variant='buttonLarge'
        elementDescriptor={descriptors.impersonationFabActionLink}
        sx={t => ({
          alignSelf: 'flex-start',
          color: t.colors.$primary500,
          ':hover': {
            cursor: 'pointer',
          },
        })}
        localizationKey={signOutText}
        onClick={
          // clerk-js has been loaded at this point so we can safely access session
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          handleSignOutSessionClicked(session!)
        }
      />
    </Col>
  );
};

const ImpersonationFabInternal = () => {
  const { session } = useSession();
  const { t } = useLocalizations();
  const { parsedInternalTheme } = useAppearance();
  const containerRef = useRef<HTMLDivElement>(null);
  const actor = session?.actor;
  const isImpersonating = !!actor;

  //essentials for calcs
  const eyeWidth = parsedInternalTheme.sizes.$16;
  const eyeHeight = eyeWidth;
  const topProperty = '--cl-impersonation-fab-top';
  const rightProperty = '--cl-impersonation-fab-right';
  const defaultTop = 109;
  const defaultRight = 23;

  const handleResize = () => {
    const current = containerRef.current;
    if (!current) {
      return;
    }

    const offsetRight = window.innerWidth - current.offsetLeft - current.offsetWidth;
    const offsetBottom = window.innerHeight - current.offsetTop - current.offsetHeight;

    const outsideViewport = [current.offsetLeft, offsetRight, current.offsetTop, offsetBottom].some(o => o < 0);

    if (outsideViewport) {
      document.documentElement.style.setProperty(rightProperty, `${defaultRight}px`);
      document.documentElement.style.setProperty(topProperty, `${defaultTop}px`);
    }
  };

  const onPointerDown: PointerEventHandler = () => {
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener(
      'pointerup',
      () => {
        window.removeEventListener('pointermove', onPointerMove);
        handleResize();
      },
      { once: true },
    );
  };

  const onPointerMove = React.useCallback((e: PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const current = containerRef.current;
    if (!current) {
      return;
    }
    const rightOffestBasedOnViewportAndContent = `${
      window.innerWidth - current.offsetLeft - current.offsetWidth - e.movementX
    }px`;
    document.documentElement.style.setProperty(rightProperty, rightOffestBasedOnViewportAndContent);
    document.documentElement.style.setProperty(topProperty, `${current.offsetTop - -e.movementY}px`);
  }, []);

  const repositionFabOnResize = () => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  useEffect(repositionFabOnResize, []);

  if (!isImpersonating || !session.user) {
    return null;
  }

  const title = localizationKeys('impersonationFab.title', {
    identifier: getFullName(session.user) || getIdentifier(session.user),
  });
  const titleLength = t(title).length;

  return (
    <Portal>
      <Flex
        ref={containerRef}
        elementDescriptor={descriptors.impersonationFab}
        onPointerDown={onPointerDown}
        align='center'
        sx={t => ({
          touchAction: 'none', //for drag to work on mobile consistently
          position: 'fixed',
          overflow: 'hidden',
          top: `var(${topProperty}, ${defaultTop}px)`,
          right: `var(${rightProperty}, ${defaultRight}px)`,
          zIndex: t.zIndices.$fab,
          boxShadow: t.shadows.$fabShadow,
          borderRadius: t.radii.$halfHeight, //to match the circular eye perfectly
          backgroundColor: t.colors.$white,
          fontFamily: t.fonts.$main,
          ':hover': {
            cursor: 'grab',
          },
          ':hover #cl-impersonationText': {
            transition: `max-width ${t.transitionDuration.$slowest} ease, opacity ${t.transitionDuration.$slower} ease ${t.transitionDuration.$slowest}`,
            maxWidth: `min(calc(50vw - ${eyeWidth} - 2 * ${defaultRight}px), ${titleLength}ch)`,
            [mqu.md]: {
              maxWidth: `min(calc(100vw - ${eyeWidth} - 2 * ${defaultRight}px), ${titleLength}ch)`,
            },
            opacity: 1,
          },
          ':hover #cl-impersonationEye': {
            transform: 'rotate(-180deg)',
          },
        })}
      >
        <EyeCircle
          id='cl-impersonationEye'
          width={eyeWidth}
          height={eyeHeight}
          sx={t => ({
            transition: `transform ${t.transitionDuration.$slowest} ease`,
          })}
        />

        <Flex
          id='cl-impersonationText'
          sx={t => ({
            transition: `max-width ${t.transitionDuration.$slowest} ease, opacity ${t.transitionDuration.$fast} ease`,
            maxWidth: '0px',
            opacity: 0,
          })}
        >
          <FabContent
            title={title}
            signOutText={localizationKeys('impersonationFab.action__signOut')}
          />
        </Flex>
      </Flex>
    </Portal>
  );
};

export const ImpersonationFab = withCoreUserGuard(() => (
  <InternalThemeProvider>
    <ImpersonationFabInternal />
  </InternalThemeProvider>
));
