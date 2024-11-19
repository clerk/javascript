import type { PointerEventHandler } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import type { LocalizationKey } from '../../customizables';
import { Col, descriptors, Flex, Link, Text } from '../../customizables';
import { Portal } from '../../elements/Portal';
import { InternalThemeProvider, mqu } from '../../styledSystem';

type AccountlessPromptProps = {
  url?: string;
};

type FabContentProps = { title?: LocalizationKey | string; signOutText: LocalizationKey | string; url: string };

const FabContent = ({ title, signOutText, url }: FabContentProps) => {
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
          () => (window.location.href = url)
          // clerk-js has been loaded at this point so we can safely access session
          // handleSignOutSessionClicked(session!)
        }
      />
    </Col>
  );
};

export const _AccountlessPrompt = (props: AccountlessPromptProps) => {
  // const { parsedInternalTheme } = useAppearance();
  const containerRef = useRef<HTMLDivElement>(null);

  //essentials for calcs
  // const eyeWidth = parsedInternalTheme.sizes.$16;
  // const eyeHeight = eyeWidth;
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

  const onPointerMove = useCallback((e: PointerEvent) => {
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

  if (!props.url) {
    return null;
  }

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
          padding: `10px`,
          zIndex: t.zIndices.$fab,
          boxShadow: t.shadows.$fabShadow,
          borderRadius: t.radii.$halfHeight, //to match the circular eye perfectly
          backgroundColor: t.colors.$white,
          fontFamily: t.fonts.$main,
          ':hover': {
            cursor: 'grab',
          },
          ':hover #cl-impersonationText': {
            transition: `max-width ${t.transitionDuration.$slowest} ease, opacity 0ms ease ${t.transitionDuration.$slowest}`,
            maxWidth: `min(calc(50vw - 2 * ${defaultRight}px), ${15}ch)`,
            [mqu.md]: {
              maxWidth: `min(calc(100vw - 2 * ${defaultRight}px), ${15}ch)`,
            },
            opacity: 1,
          },
        })}
      >
        🔓Accountless Mode
        <Flex
          id='cl-impersonationText'
          sx={t => ({
            transition: `max-width ${t.transitionDuration.$slowest} ease, opacity ${t.transitionDuration.$fast} ease`,
            maxWidth: '0px',
            opacity: 1,
          })}
        >
          <FabContent
            url={props.url}
            signOutText={'Claim your keys'}
          />
        </Flex>
      </Flex>
    </Portal>
  );
};

export const AccountlessPrompt = (props: AccountlessPromptProps) => (
  <InternalThemeProvider>
    <_AccountlessPrompt {...props} />
  </InternalThemeProvider>
);
