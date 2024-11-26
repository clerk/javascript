// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/react';
import type { PointerEventHandler } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { LocalizationKey } from '../../customizables';
import { Col, descriptors, Flex, Link, Text } from '../../customizables';
import { Portal } from '../../elements/Portal';
import { InternalThemeProvider } from '../../styledSystem';
import ClerkLogoIcon from './ClerkLogoIcon';

type AccountlessPromptProps = {
  url?: string;
};

type FabContentProps = { title?: LocalizationKey | string; signOutText: LocalizationKey | string; url: string };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const [isExpanded, setIsExpanded] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  //essentials for calcs
  // const eyeWidth = parsedInternalTheme.sizes.$16;
  // const eyeHeight = eyeWidth;
  const bottomProperty = '--cl-impersonation-fab-bottom';
  const rightProperty = '--cl-impersonation-fab-right';
  const defaultBottom = 109;
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
      document.documentElement.style.setProperty(bottomProperty, `${defaultBottom}px`);
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
    document.documentElement.style.setProperty(bottomProperty, `${current.offsetTop - -e.movementY}px`);
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
        onMouseEnter={() => setIsExpanded(true)}
        sx={t => ({
          touchAction: 'none', //for drag to work on mobile consistently
          position: 'fixed',
          bottom: `var(${bottomProperty}, ${defaultBottom}px)`,
          right: `var(${rightProperty}, ${defaultRight}px)`,
          padding: `${t.space.$1x5} ${t.space.$1x5} ${t.space.$1x5} ${t.space.$3}`,
          height: `${t.sizes.$10}`,
          width: '297px',
          borderRadius: '20px',
          zIndex: t.zIndices.$fab,
          boxShadow: t.shadows.$fabShadow,
          color: t.colors.$whiteAlpha600,
          fontWeight: t.fontWeights.$semibold,
          fontFamily: t.fonts.$main,
          transition: `width ${t.transitionDuration.$slower} ${t.transitionTiming.$slowBezier}, borderRadius ${t.transitionDuration.$slower} ${t.transitionTiming.$slowBezier}, height 200ms cubic-bezier(0.34, 1.2, 0.64, 1)`,

          // custom
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.00) 100%), #1F1F1F',

          ...(isExpanded && {
            flexDirection: 'column',
            gap: `${t.space.$1x5}`,
            padding: `${t.space.$2x5} ${t.space.$3} ${t.space.$3} ${t.space.$3}`,
            height: '140px',
            width: '258PX',
            borderRadius: `${t.radii.$xl}`,
          }),
        })}
      >
        {/* // TODO: add clerk logo + key icon */}
        <Flex
          sx={{
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Flex align='center'>
            <ClerkLogoIcon />

            <Text sx={t => ({ color: t.colors.$white, fontSize: t.fontSizes.$md, fontWeight: t.fontWeights.$medium })}>
              Clerk is in keyless mode
            </Text>
          </Flex>

          <Flex
            as='span'
            onClick={() => setIsExpanded(false)}
            sx={t => ({
              cursor: 'pointer',
              color: t.colors.$whiteAlpha400,
              display: `${isExpanded ? 'block' : 'none'}`,
              transition: `color ${t.transitionDuration.$fast} ${t.transitionTiming.$common}`,
              ':hover': { color: t.colors.$whiteAlpha800 },
            })}
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M3.75 8H12.25'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </Flex>
        </Flex>

        <button
          type='button'
          css={css`
            position: absolute;
            right: 6px;
            bottom: 6px;

            height: 28px;
            width: 82px;

            overflow: hidden;
            padding: 4px 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 16px;
            border: none;
            cursor: pointer;
            color: white;
            font-size: 12px;
            font-weight: 600;
            line-height: 16px;
            letter-spacing: 0.12px;
            text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.32);
            white-space: nowrap;
            background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30.5%, rgba(0, 0, 0, 0.05) 100%),
              var(--Gray-gray-1100, #636363);
            box-shadow:
              0px 0px 4px 0px rgba(243, 107, 22, 0) inset,
              0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
              0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
              0px 0px 0px 1px rgba(0, 0, 0, 0.12),
              0px 1.5px 2px 0px rgba(0, 0, 0, 0.48);

            transition:
              all 200ms ease,
              box-shadow 500ms ease;
            animation: small-btn-glow 3s infinite;

            ${isExpanded &&
            `
              position: absolute;
              right: 12px;
              bottom: 12px;
              height: 28px;
              width: 234px;
              padding: 4px 10px 4px 10px;
              padding-bottom: 4px;
              color: #fde047;
              border: none;
              border-radius: 6px;
              background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30.5%, rgba(0, 0, 0, 0.05) 100%), #454545;
              box-shadow:
                0px 0px 3px 0px rgba(253, 224, 71, 0) inset,
                0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
  				  0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
                0px 0px 0px 1px rgba(0, 0, 0, 0.12),
                0px 1.5px 2px 0px rgba(0, 0, 0, 0.48);
              animation: expanded-btn-glow 2s infinite;
            `}
          `}
        >
          Claim test
        </button>
        {/* <Button
          textVariant='buttonSmall'
          sx={t => ({
            width: '82px',
            height: '28px',
            position: 'absolute',
            borderRadius: `16px`,
            right: `${t.space.$1x5}`,
            bottom: `${t.space.$1x5}`,
            whiteSpace: 'nowrap',
            color: t.colors.$white,
            background: ' #636363',

            ':hover': {
              //to add
            },

            ...(isExpanded && {
              width: '234px',
              transition: `all ${t.transitionDuration.$slow} ${t.transitionTiming.$common}`,
              borderRadius: isExpanded ? t.radii.$md : '16px',
              right: isExpanded ? t.space.$3 : t.space.$1x5,
              bottom: isExpanded ? t.space.$3 : t.space.$1x5,
              position: 'absolute',
              height: '28px',
              whiteSpace: 'nowrap',
              color: '#FDE047',
              // custom
              background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 30.5%, rgba(0, 0, 0, 0.05) 100%), #454545',
              boxShadow:
                '0px 0px 3px 0px rgba(253, 224, 71, 0.00) inset, 0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset, 0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset, 0px 0px 0px 1px rgba(0, 0, 0, 0.12), 0px 1.5px 2px 0px rgba(0, 0, 0, 0.48)',
            }),
          })}
        >
          Claim keys
        </Button> */}
        <Text
          sx={t => ({
            color: t.colors.$whiteAlpha600,
            display: `${isExpanded ? 'block' : 'none'}`,
            fontSize: t.fontSizes.$sm,
            fontWeight: t.fontWeights.$normal,
          })}
        >
          We noticed your app was running without API Keys. Claim this instance by linking a Clerk account. Learn more
        </Text>
      </Flex>
    </Portal>
  );
};

export const AccountlessPrompt = (props: AccountlessPromptProps) => (
  <InternalThemeProvider>
    <_AccountlessPrompt {...props} />
  </InternalThemeProvider>
);
