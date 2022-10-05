import React, { PointerEventHandler, useEffect, useRef } from 'react';

import { mqu, PropsOfComponent } from '../../ui/styledSystem';
import { getFullName, getIdentifier } from '../../ui/utils';
import { useCoreClerk, useCoreSession } from '../contexts';
import {
  Col,
  descriptors,
  Flex,
  Icon,
  Link,
  LocalizationKey,
  localizationKeys,
  Text,
  useAppearance,
  useLocalizations,
} from '../customizables';
import { Portal } from '../elements/Portal';
import { Eye } from '../icons';

type EyeCircleProps = PropsOfComponent<typeof Col> & {
  width: string;
  height: string;
};

const EyeCircle = ({ width, height, ...props }: EyeCircleProps) => {
  const { sx, ...rest } = props;
  return (
    <Col
      id='cl-impersonationEye'
      elementDescriptor={descriptors.impersonationFabIconContainer}
      center
      sx={[
        t => ({
          width,
          height,
          transition: `transform ${t.transitionDuration.$slowest} ease`,
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
        size={undefined}
      />
    </Col>
  );
};

type FabContentProps = { title: LocalizationKey; signOutText: LocalizationKey };

const FabContent = ({ title, signOutText }: FabContentProps) => {
  const { signOut } = useCoreClerk();

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
        colorScheme='neutral'
        elementDescriptor={descriptors.impersonationFabTitle}
        variant='regularMedium'
        truncate
        localizationKey={title}
      />
      <Link
        variant='regularMedium'
        elementDescriptor={descriptors.impersonationFabActionLink}
        sx={t => ({
          alignSelf: 'flex-start',
          color: t.colors.$primary500,
          ':hover': {
            cursor: 'pointer',
          },
        })}
        localizationKey={signOutText}
        onClick={async () => {
          await signOut();
        }}
      />
    </Col>
  );
};

export const ImpersonationFab = () => {
  const session = useCoreSession();
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

    const outsideViewport =
      current.offsetLeft < 0 ||
      current.offsetLeft > window.innerWidth ||
      current.offsetTop < 0 ||
      current.offsetTop > window.innerHeight;

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
    document.documentElement.style.setProperty(topProperty, `${current.offsetTop + e.movementY}px`);
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
        align='center'
        sx={t => ({
          position: 'fixed',
          overflow: 'hidden',
          top: `var(${topProperty}, ${defaultTop}px)`,
          right: `var(${rightProperty}, ${defaultRight}px)`,
          zIndex: t.zIndices.$fab,
          boxShadow: t.shadows.$fabShadow,
          borderRadius: t.radii.$halfHeight, //to match the circular eye perfectly
          backgroundColor: t.colors.$white,
          fontFamily: t.fonts.$main,
          ':hover #cl-impersonationText': {
            maxWidth: `min(calc(50vw - ${eyeWidth} - 2 * ${defaultRight}px), ${titleLength}ch)`,
            [mqu.md]: {
              maxWidth: `min(calc(100vw - ${eyeWidth} - 2 * ${defaultRight}px), ${titleLength}ch)`,
            },
          },
          ':hover #cl-impersonationEye': {
            transform: 'rotate(-180deg)',
          },
        })}
      >
        <EyeCircle
          onPointerDown={onPointerDown}
          sx={{
            ':hover': {
              cursor: 'grab',
            },
          }}
          width={eyeWidth}
          height={eyeHeight}
        />

        <Flex
          id='cl-impersonationText'
          sx={t => ({
            maxWidth: '0px',
            transition: `max-width ${t.transitionDuration.$slowest} ease`,
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
