import { getFullName, getIdentifier } from '@clerk/shared/internal/clerk-js/user';
import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { SignedInSessionResource } from '@clerk/shared/types';
import { useEffect, useRef } from 'react';

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
import { useDragGesture } from '../../hooks/useDragGesture';
import { useMultipleSessions } from '../../hooks/useMultipleSessions';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
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
        paddingInlineStart: t.sizes.$4,
        paddingInlineEnd: t.sizes.$6,
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
  const prefersReducedMotion = usePrefersReducedMotion();
  const actor = session?.actor;
  const agent = session?.agent;
  const isImpersonating = !!actor && !agent;

  //essentials for calcs
  const eyeWidth = parsedInternalTheme.sizes.$16;
  const eyeHeight = eyeWidth;
  const topProperty = '--cl-impersonation-fab-top';
  const rightProperty = '--cl-impersonation-fab-right';
  const defaultTop = 109;
  const defaultRight = 23;
  const viewportInset = 20;

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

  const settleIntoViewport = () => {
    const current = containerRef.current;
    if (!current) {
      return;
    }

    const bounds = current.getBoundingClientRect();
    const from = { top: bounds.top, offsetRight: window.innerWidth - bounds.right };
    const to = {
      top: Math.min(Math.max(from.top, viewportInset), window.innerHeight - bounds.height - viewportInset),
      offsetRight: Math.min(
        Math.max(from.offsetRight, viewportInset),
        window.innerWidth - bounds.width - viewportInset,
      ),
    };
    if (from.top === to.top && from.offsetRight === to.offsetRight) {
      return;
    }

    document.documentElement.style.setProperty(rightProperty, `${to.offsetRight}px`);
    document.documentElement.style.setProperty(topProperty, `${to.top}px`);
    if (!prefersReducedMotion) {
      current.animate(
        [
          // eslint-disable-next-line custom-rules/no-physical-css-properties -- Complex JS-based positioning via CSS custom properties
          { top: `${from.top}px`, right: `${from.offsetRight}px` },
          // eslint-disable-next-line custom-rules/no-physical-css-properties -- Complex JS-based positioning via CSS custom properties
          { top: `${to.top}px`, right: `${to.offsetRight}px` },
        ],
        { duration: 350, easing: 'cubic-bezier(0.34, 1.2, 0.64, 1)' },
      );
    }
  };

  const dragStart = useRef<{ top: number; offsetRight: number } | null>(null);
  const { onPointerDown } = useDragGesture({
    onDragStart: () => {
      const bounds = containerRef.current?.getBoundingClientRect();
      dragStart.current = bounds ? { top: bounds.top, offsetRight: window.innerWidth - bounds.right } : null;
    },
    onDrag: ({ x, y }) => {
      if (!dragStart.current) {
        return;
      }
      document.documentElement.style.setProperty(rightProperty, `${dragStart.current.offsetRight - x}px`);
      document.documentElement.style.setProperty(topProperty, `${dragStart.current.top + y}px`);
    },
    onDragEnd: settleIntoViewport,
  });

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
          // eslint-disable-next-line custom-rules/no-physical-css-properties -- Complex JS-based positioning via CSS custom properties
          right: `var(${rightProperty}, ${defaultRight}px)`,
          zIndex: t.zIndices.$fab,
          boxShadow: t.shadows.$fabShadow,
          borderRadius: t.radii.$halfHeight, //to match the circular eye perfectly
          backgroundColor: t.colors.$colorBackground,
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
