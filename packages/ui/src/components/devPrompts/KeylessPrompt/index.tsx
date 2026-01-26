import { useUser } from '@clerk/shared/react';
// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/react';
import type { PropsWithChildren } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { Flex, Link } from '../../../customizables';
import { Portal } from '../../../elements/Portal';
import { MosaicThemeProvider, useMosaicTheme } from '../../../mosaic/theme-provider';
import { InternalThemeProvider } from '../../../styledSystem';
import {
  basePromptElementStyles,
  ClerkLogoIcon,
  handleDashboardUrlParsing,
  PromptContainer,
  PromptSuccessIcon,
} from '../shared';
import { KeySlashIcon } from './KeySlashIcon';
import { useRevalidateEnvironment } from './use-revalidate-environment';

type KeylessPromptProps = {
  claimUrl: string;
  copyKeysUrl: string;
  onDismiss: (() => Promise<unknown>) | undefined | null;
};

const buttonIdentifierPrefix = `--clerk-keyless-prompt`;
const buttonIdentifier = `${buttonIdentifierPrefix}-button`;
const contentIdentifier = `${buttonIdentifierPrefix}-content`;

// Animation timing constants
const ANIMATION_DURATION = '200ms';
const CONTENT_FADE_DURATION = '200ms';
const CONTENT_FADE_DELAY = '40ms';
const EASING_CURVE = 'cubic-bezier(0.2, 0, 0, 1)';

/**
 * If we cannot reconstruct the url properly, then simply fallback to Clerk Dashboard
 */
function withLastActiveFallback(cb: () => string): string {
  try {
    return cb();
  } catch {
    return 'https://dashboard.clerk.com/last-active';
  }
}

const _KeylessPromptInternal = (_props: KeylessPromptProps) => {
  const { isSignedIn } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      setIsExpanded(true);
    }
  }, [isSignedIn]);

  // Track animation state to prevent interactions during transition
  useEffect(() => {
    if (!isAnimating) {
      return;
    }
    const timer = setTimeout(() => setIsAnimating(false), 200);
    return () => clearTimeout(timer);
  }, [isAnimating]);

  const environment = useRevalidateEnvironment();
  const claimed = Boolean(environment.authConfig.claimedAt);
  const success = typeof _props.onDismiss === 'function' && claimed;
  const appName = environment.displayConfig.applicationName;

  const isForcedExpanded = claimed || success || isExpanded;

  const claimUrlToDashboard = useMemo(() => {
    if (claimed) {
      return _props.copyKeysUrl;
    }

    const url = new URL(_props.claimUrl);
    // Clerk Dashboard accepts a `return_url` query param when visiting `/apps/claim`.
    url.searchParams.append('return_url', window.location.href);
    return url.href;
  }, [claimed, _props.copyKeysUrl, _props.claimUrl]);

  const instanceUrlToDashboard = useMemo(() => {
    return withLastActiveFallback(() => {
      const redirectUrlParts = handleDashboardUrlParsing(_props.copyKeysUrl);
      const url = new URL(
        `${redirectUrlParts.baseDomain}/apps/${redirectUrlParts.appId}/instances/${redirectUrlParts.instanceId}/user-authentication/email-phone-username`,
      );
      return url.href;
    });
  }, [_props.copyKeysUrl]);

  const ctaButtonColor = claimed || success ? 'white' : '#fde047';

  const mainCTAStyles = css`
    ${basePromptElementStyles};
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 1.75rem;
    max-width: 14.625rem;
    padding: 0.25rem 0.625rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.12px;
    color: ${ctaButtonColor};
    text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.32);
    white-space: nowrap;
    user-select: none;
    cursor: pointer;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30.5%, rgba(0, 0, 0, 0.05) 100%), #454545;
    box-shadow:
      0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
      0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
      0px 0px 0px 1px rgba(0, 0, 0, 0.12),
      0px 1.5px 2px 0px rgba(0, 0, 0, 0.48),
      0px 0px 4px 0px rgba(243, 107, 22, 0) inset;
  `;

  const ctaButtonHoverStyles = claimed
    ? 'background: #4B4B4B; transition: all 120ms ease-in-out;'
    : `box-shadow:
      0px 0px 6px 0px rgba(253, 224, 71, 0.24) inset,
      0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
      0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
      0px 0px 0px 1px rgba(0, 0, 0, 0.12),
      0px 1.5px 2px 0px rgba(0, 0, 0, 0.48);`;

  function renderStatusIcon() {
    if (success) {
      return (
        <PromptSuccessIcon
          css={css`
            width: 1rem;
            height: 1rem;
          `}
        />
      );
    }

    if (claimed) {
      return (
        <svg
          width='1rem'
          height='1rem'
          viewBox='0 0 16 16'
          aria-hidden
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M8 5.75V7.25M8 10.2502V10.2602M13.25 8C13.25 10.8995 10.8995 13.25 8 13.25C5.10051 13.25 2.75 10.8995 2.75 8C2.75 5.10051 5.10051 2.75 8 2.75C10.8995 2.75 13.25 5.10051 13.25 8Z'
            stroke='#F36B16'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      );
    }

    return (
      <div
        css={css`
          perspective: 1000px;
          position: relative;
          width: 1rem;
          height: 1rem;
          transform-style: preserve-3d;
          animation: ${isForcedExpanded ? 'coinFlipAnimation 12s infinite linear' : 'none'};

          @keyframes coinFlipAnimation {
            0%,
            55% {
              transform: rotateY(0);
            }
            60%,
            95% {
              transform: rotateY(180deg);
            }
            100% {
              transform: rotateY(0);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            animation: none;
          }
        `}
      >
        <span
          className='coin-flip-front'
          aria-hidden
          css={css`
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <ClerkLogoIcon />
        </span>

        <span
          className='coin-flip-back'
          aria-hidden
          css={css`
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            transform: rotateY(180deg);
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <KeySlashIcon />
        </span>
      </div>
    );
  }

  function getStatusText() {
    if (success) {
      return 'Claim completed';
    }
    if (claimed) {
      return 'Missing environment keys';
    }
    return 'Clerk is in keyless mode';
  }

  const contentParagraphStyles = css`
    ${basePromptElementStyles};
    color: #b4b4b4;
    font-size: 0.8125rem;
    font-weight: 400;
    line-height: 1rem;
  `;

  const titleTextStyles = css`
    ${basePromptElementStyles};
    color: #d9d9d9;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
  `;

  return (
    <Portal>
      <PromptContainer
        data-expanded={isForcedExpanded}
        sx={t => ({
          interpolateSize: 'allow-keywords',
          position: 'fixed',
          bottom: '1.25rem',
          right: '1.25rem',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          overflow: 'clip',
          width: '13.5rem',
          height: '2.375rem',
          borderRadius: '1.25rem',
          transition: `width ${ANIMATION_DURATION} ${EASING_CURVE},
                       height ${ANIMATION_DURATION} ${EASING_CURVE},
                       padding ${ANIMATION_DURATION} ${EASING_CURVE},
                       border-radius ${ANIMATION_DURATION} ${EASING_CURVE},
                       background ${ANIMATION_DURATION} ${EASING_CURVE}`,

          '&[data-expanded="false"]:hover': {
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0) 100%), #1f1f1f',
          },

          '&[data-expanded="true"]': {
            width: '16.125rem',
            height: 'fit-content',
            borderRadius: `${t.radii.$xl}`,
          },
        })}
      >
        <Flex
          sx={t => ({
            padding: `${t.space.$2} ${t.space.$3}`,
            maskImage: `linear-gradient(to bottom, black calc(100% - ${t.space.$3}), transparent)`,
            flexDirection: 'column',
          })}
        >
          <button
            type='button'
            aria-expanded={isForcedExpanded}
            aria-controls={contentIdentifier}
            id={buttonIdentifier}
            onClick={() => {
              if (!claimed && !isAnimating) {
                setIsAnimating(true);
                setIsExpanded(prev => !prev);
              }
            }}
            disabled={isAnimating}
            css={css`
              ${basePromptElementStyles};
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              ${isAnimating ? 'pointer-events: none; cursor: wait;' : ''}
            `}
          >
            <Flex
              sx={t => ({
                alignItems: 'center',
                gap: t.space.$2,
              })}
            >
              {renderStatusIcon()}

              <p
                data-text='Clerk is in keyless mode'
                aria-label={getStatusText()}
                css={titleTextStyles}
              >
                {getStatusText()}
              </p>
            </Flex>

            <svg
              width='1rem'
              height='1rem'
              viewBox='0 0 16 16'
              fill='none'
              aria-hidden
              xmlns='http://www.w3.org/2000/svg'
              css={css`
                color: #8c8c8c;
                transition: color 120ms ease-out;
                display: ${isExpanded && !claimed && !success ? 'block' : 'none'};
                cursor: pointer;

                :hover {
                  color: #eeeeee;
                }

                animation: show-button 300ms ease;
                @keyframes show-button {
                  from {
                    transform: scaleX(0.9);
                    opacity: 0;
                  }
                  to {
                    transform: scaleX(1);
                    opacity: 1;
                  }
                }
              `}
            >
              <path
                d='M3.75 8H12.25'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>

          <Flex
            sx={t => ({
              flexDirection: 'column',
              gap: t.space.$3,
              opacity: isForcedExpanded ? 1 : 0,
              transition: `opacity ${CONTENT_FADE_DURATION} ${EASING_CURVE}`,
              transitionDelay: isForcedExpanded ? CONTENT_FADE_DELAY : '0ms',
              pointerEvents: isForcedExpanded ? 'auto' : 'none',
              // paddingBlockEnd: t.space.$3,
              // maskImage: `linear-gradient(to bottom, black calc(100% - ${t.space.$3}), transparent)`,
            })}
          >
            <div
              role='region'
              id={contentIdentifier}
              aria-labelledby={buttonIdentifier}
              aria-hidden={!isForcedExpanded}
            >
              <div
                css={css`
                  display: flex;
                  flex-direction: column;
                  gap: 0.5rem;
                  color: #b4b4b4;
                  max-width: 14.625rem;
                `}
              >
                {success ? (
                  <p css={contentParagraphStyles}>
                    Your application{' '}
                    <span
                      css={css`
                        ${basePromptElementStyles};
                        display: inline-block;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 8.125rem;
                        vertical-align: bottom;
                        font-size: 0.8125rem;
                        font-weight: 500;
                        color: #d5d5d5;
                      `}
                    >
                      {appName}
                    </span>{' '}
                    has been claimed. Configure settings from the{' '}
                    <Link
                      isExternal
                      aria-label='Go to Dashboard to configure settings'
                      href={instanceUrlToDashboard}
                      sx={t => ({
                        color: t.colors.$whiteAlpha600,
                        textDecoration: 'underline solid',
                        transition: `${t.transitionTiming.$common} ${t.transitionDuration.$fast}`,
                        ':hover': {
                          color: t.colors.$whiteAlpha800,
                        },
                      })}
                    >
                      Clerk Dashboard
                    </Link>
                  </p>
                ) : claimed ? (
                  <p css={contentParagraphStyles}>
                    You claimed this application but haven&apos;t set keys in your environment. Get them from the Clerk
                    Dashboard.
                  </p>
                ) : isSignedIn ? (
                  <p css={contentParagraphStyles}>
                    <span>
                      You&apos;ve created your first user! Link this application to your Clerk account to explore the
                      Dashboard.
                    </span>
                  </p>
                ) : (
                  <>
                    <p
                      css={css`
                        ${contentParagraphStyles};
                        text-wrap: pretty;
                      `}
                    >
                      Temporary API keys are enabled so you can get started immediately.
                    </p>
                    <p
                      css={css`
                        ${contentParagraphStyles};
                        text-wrap: pretty;
                      `}
                    >
                      Claim this application to access the Clerk Dashboard where you can manage auth settings and
                      explore more Clerk features.
                    </p>
                  </>
                )}
              </div>
            </div>

            {success ? (
              <button
                type='button'
                onClick={() => {
                  void (async () => {
                    await _props.onDismiss?.();
                    window.location.reload();
                  })();
                }}
                css={css`
                  ${mainCTAStyles};

                  &:hover {
                    background: #4b4b4b;
                    transition: all 120ms ease-in-out;
                  }
                `}
              >
                Dismiss
              </button>
            ) : (
              <Flex
                sx={t => ({
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: t.space.$2x5,
                })}
              >
                <a
                  href={claimUrlToDashboard}
                  target='_blank'
                  rel='noopener noreferrer'
                  css={css`
                    ${mainCTAStyles};
                    opacity: ${isForcedExpanded ? 1 : 0};
                    ${isAnimating ? 'pointer-events: none; opacity: 0.6;' : ''}
                    transition: opacity ${isForcedExpanded ? CONTENT_FADE_DURATION : '80ms'} ${EASING_CURVE};
                    transitiondelay: ${isForcedExpanded ? CONTENT_FADE_DELAY : '0ms'};

                    &:hover {
                      ${isAnimating ? '' : ctaButtonHoverStyles}
                    }
                  `}
                >
                  {claimed ? 'Get API keys' : 'Claim application'}
                </a>
              </Flex>
            )}
          </Flex>
        </Flex>
      </PromptContainer>
      <BodyPortal>
        <a
          href={`#${buttonIdentifier}`}
          css={css`
            position: fixed;
            left: -999px;
            top: 1rem;
            z-index: 999999;
            border-radius: 0.375rem;
            background-color: white;
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
            color: black;
            text-decoration: underline;

            &:focus {
              left: 1rem;
              outline: 2px solid;
              outline-offset: 2px;
            }
          `}
        >
          Skip to Clerk keyless mode content
        </a>
      </BodyPortal>
    </Portal>
  );
};

function KeylessPromptInternal(_props: KeylessPromptProps) {
  return (
    <MosaicThemeProvider>
      <KeylessPromptContent />
    </MosaicThemeProvider>
  );
}

function KeylessPromptContent() {
  const [isOpen, setIsOpen] = useState(false);
  const id = React.useId();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const theme = useMosaicTheme();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <Portal>
      <div
        ref={containerRef}
        css={css`
          --duration-open: 220ms;
          --duration-close: 180ms;
          --ease-bezier: cubic-bezier(0.2, 0, 0, 1);
          --font-family: ${theme.fontFamilies.sans};
          --background: ${theme.colors.gray[1400]};
          --foreground: ${theme.colors.white};
          --foreground-secondary: ${theme.colors.gray[500]};
          --accent: ${theme.colors.purple[700]};
          --offset: ${theme.spacing[5]};
          --width-opened: 18rem;
          --width-closed: 13rem;
          position: fixed;
          bottom: var(--offset);
          right: var(--offset);
          z-index: 999999;
          height: auto;
          width: ${isOpen ? 'var(--width-opened)' : 'var(--width-closed)'};
          interpolate-size: allow-keywords;
          background:
            linear-gradient(
              180deg,
              ${theme.alpha(theme.colors.white, 1)} 0%,
              ${theme.alpha(theme.colors.white, 0)} 100%
            ),
            var(--background);
          box-shadow:
            0px 0px 0px 0.5px ${theme.colors.gray[1200]} inset,
            0px 1px 0px 0px ${theme.alpha(theme.colors.white, 8)} inset,
            0px 0px 0.8px 0.8px ${theme.alpha(theme.colors.white, 20)} inset,
            0px 0px 0px 0px ${theme.alpha(theme.colors.white, 72)},
            0px 16px 36px -6px ${theme.alpha(theme.colors.black, 36)},
            0px 6px 16px -2px ${theme.alpha(theme.colors.black, 20)};
          border-radius: ${isOpen ? theme.spacing[3] : theme.spacing[10]};
          isolation: isolate;
          will-change: width, border-radius;
          transform: translateZ(0);
          backface-visibility: hidden;
          transition:
            width ${isOpen ? 'var(--duration-open)' : 'var(--duration-close)'} var(--ease-bezier),
            border-radius var(--duration-open) var(--ease-bezier);
          @media (prefers-reduced-motion: reduce) {
            transition: none;
          }
          &::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, ${theme.colors.white} 46%, ${theme.alpha(theme.colors.white, 0)} 54%);
            mix-blend-mode: overlay;
            border-radius: inherit;
            pointer-events: none;
            opacity: ${isOpen ? 0 : 1};
            transition: opacity ${isOpen ? 'var(--duration-open)' : 'var(--duration-close)'} var(--ease-bezier);
            @media (prefers-reduced-motion: reduce) {
              transition: none;
            }
          }
          &:has(button:focus-visible) {
            outline: 2px solid var(--accent);
            outline-offset: 2px;
          }
        `}
      >
        <button
          type='button'
          onClick={() => setIsOpen(prev => !prev)}
          aria-expanded={isOpen}
          aria-controls={id}
          css={css`
            appearance: none;
            border: none;
            background-color: transparent;
            display: flex;
            align-items: center;
            width: 100%;
            border-radius: inherit;
            padding-block: ${theme.spacing[3]};
            position: relative;
            outline: none;
          `}
        >
          <span
            css={css`
              margin-inline-start: ${theme.spacing[3]};
              margin-inline-end: ${theme.spacing[1]};
              display: flex;
              align-items: center;
              justify-content: center;
            `}
          >
            <svg
              css={css`
                --size: ${theme.spacing[4]};
                flex-shrink: 0;
                width: var(--size);
                height: var(--size);
                color: var(--foreground);
              `}
              viewBox='0 0 128 128'
              fill='none'
              aria-hidden
            >
              <circle
                cx='64'
                cy='64'
                r='20'
                fill='currentColor'
              />
              <path
                d='M99.5716 10.788C101.571 12.1272 101.742 14.9444 100.04 16.646L85.4244 31.2618C84.1035 32.5828 82.0542 32.7914 80.3915 31.9397C75.4752 29.421 69.9035 28 64 28C44.1177 28 28 44.1177 28 64C28 69.9035 29.421 75.4752 31.9397 80.3915C32.7914 82.0542 32.5828 84.1035 31.2618 85.4244L16.646 100.04C14.9444 101.742 12.1272 101.571 10.788 99.5716C3.97411 89.3989 0 77.1635 0 64C0 28.6538 28.6538 0 64 0C77.1635 0 89.3989 3.97411 99.5716 10.788Z'
                fill='currentColor'
                fillOpacity='0.4'
              />
              <path
                d='M100.04 111.354C101.742 113.056 101.571 115.873 99.5717 117.212C89.3989 124.026 77.1636 128 64 128C50.8364 128 38.6011 124.026 28.4283 117.212C26.4289 115.873 26.2581 113.056 27.9597 111.354L42.5755 96.7382C43.8965 95.4172 45.9457 95.2085 47.6084 96.0603C52.5248 98.579 58.0964 100 64 100C69.9036 100 75.4753 98.579 80.3916 96.0603C82.0543 95.2085 84.1036 95.4172 85.4245 96.7382L100.04 111.354Z'
                fill='currentColor'
              />
            </svg>
          </span>
          <span
            css={css`
              font-family: var(--font-family);
              font-size: ${theme.typography.label[2].fontSize};
              font-weight: ${theme.fontWeights.medium};
              line-height: ${theme.typography.label[2].lineHeight};
              white-space: nowrap;
              color: var(--foreground);
              background: linear-gradient(
                90deg,
                var(--foreground-secondary) 0%,
                var(--foreground-secondary) 35%,
                #fff 50%,
                var(--foreground-secondary) 65%,
                var(--foreground-secondary) 100%
              );
              background-size: 400% 100%;
              background-position: 100% center;
              background-clip: text;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: text-shimmer 2.75s ease-in-out infinite;

              @keyframes text-shimmer {
                from {
                  background-position: 100% center;
                }
                to {
                  background-position: 0% center;
                }
              }

              @media (prefers-reduced-motion: reduce) {
                animation: none;
                background: none;
                -webkit-text-fill-color: var(--foreground-secondary);
              }
            `}
          >
            Clerk is in keyless mode
          </span>
          <span
            css={css`
              clip: rect(0 0 0 0);
              clippath: inset(50%);
              height: 1px;
              overflow: hidden;
              position: absolute;
              whitespace: nowrap;
              width: 1px;
            `}
          >
            {isOpen ? 'Collapse' : 'Expand'} prompt content
          </span>
          <svg
            viewBox='0 0 16 16'
            fill='none'
            aria-hidden='true'
            css={css`
              --size: ${theme.spacing[4]};
              flex-shrink: 0;
              width: var(--size);
              height: var(--size);
              color: var(--foreground);
              margin-inline-start: auto;
              margin-inline-end: ${theme.spacing[3]};
              opacity: ${isOpen ? 0.6 : 0};
              transform: translateX(${isOpen ? '0' : theme.spacing[3]});
              transition:
                opacity 120ms ease-out,
                transform 200ms ease-out;
              button:hover & {
                opacity: ${isOpen ? 1 : 0};
              }
            `}
          >
            <path
              d='M3.75 8H12.25'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>

        <div
          id={id}
          css={css`
            display: grid;
            grid-template-rows: ${isOpen ? '1fr' : '0fr'};
            transition: grid-template-rows ${isOpen ? 'var(--duration-open)' : 'var(--duration-close)'}
              var(--ease-bezier);
            @media (prefers-reduced-motion: reduce) {
              transition: none;
            }
          `}
          {...(!isOpen && { inert: '' })}
          aria-hidden={!isOpen}
        >
          <div
            css={css`
              overflow: hidden;
              min-height: 0;
              mask-image: linear-gradient(to bottom, black calc(100% - ${theme.spacing[3]}), transparent);
            `}
          >
            <div
              css={css`
                width: var(--width-opened);
                display: flex;
                flex-direction: column;
                padding: 0 ${theme.spacing[3]} ${theme.spacing[3]} ${theme.spacing[3]};
                gap: ${theme.spacing[3]};
                opacity: ${isOpen ? 1 : 0};
                filter: blur(${isOpen ? '0px' : '6px'});
                transition-delay: ${isOpen ? '100ms' : '0ms'};
                transition:
                  opacity ${isOpen ? 'var(--duration-open)' : 'var(--duration-close)'} var(--ease-bezier),
                  filter ${isOpen ? 'var(--duration-open)' : 'var(--duration-close)'} var(--ease-bezier);
                @media (prefers-reduced-motion: reduce) {
                  transition: none;
                }
              `}
            >
              <div
                css={css`
                  display: flex;
                  flex-direction: column;
                  gap: ${theme.spacing[2]};
                  color: var(--foreground-secondary);
                  font-size: ${theme.typography.body[3].fontSize};
                  line-height: ${theme.typography.body[3].lineHeight};
                `}
              >
                <p>Temporary API keys are enabled so you can get started immediately.</p>
                <p>
                  Claim this application to access the Clerk Dashboard where you can manage auth settings and explore
                  more Clerk features.
                </p>
              </div>
              <a
                href='/'
                target='_blank'
                rel='noopener noreferrer'
                css={css`
                  position: relative;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: ${theme.spacing[1]};
                  width: 100%;
                  height: ${theme.spacing[7]};
                  border-radius: ${theme.spacing[1.5]};
                  font-size: ${theme.typography.label[3].fontSize};
                  font-weight: ${theme.fontWeights.medium};
                  color: var(--foreground);
                  background: var(--accent);
                  box-shadow:
                    ${theme.colors.white} 0px 0px 0px 0px,
                    var(--accent) 0px 0px 0px 1px,
                    ${theme.alpha(theme.colors.white, 7)} 0px 1px 0px 0px inset,
                    ${theme.alpha(theme.colors.gray[1300], 20)} 0px 1px 3px 0px;
                  outline: none;
                  &::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                      180deg,
                      ${theme.alpha(theme.colors.white, 16)} 46%,
                      ${theme.alpha(theme.colors.white, 0)} 54%
                    );
                    mix-blend-mode: overlay;
                    border-radius: inherit;
                  }
                  &:focus-visible {
                    outline: 2px solid var(--accent);
                    outline-offset: 2px;
                  }
                `}
              >
                <span
                  css={css`
                    position: relative;
                    z-index: 1;
                  `}
                >
                  Claim application
                </span>
                <svg
                  css={css`
                    flex-shrink: 0;
                    width: ${theme.spacing[2.5]};
                    height: ${theme.spacing[2.5]};
                    opacity: 0.6;
                  `}
                  viewBox='0 0 10 10'
                  aria-hidden='true'
                  className=''
                >
                  <path
                    fill='currentColor'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='1.5'
                    d='m7.25 5-3.5-2.25v4.5L7.25 5Z'
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

export const KeylessPrompt = (props: KeylessPromptProps) => (
  <InternalThemeProvider>
    <KeylessPromptInternal {...props} />
  </InternalThemeProvider>
);

const BodyPortal = ({ children }: PropsWithChildren) => {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = document.createElement('div');
    setPortalContainer(container);
    document.body.insertBefore(container, document.body.firstChild);
    return () => {
      if (container) {
        document.body.removeChild(container);
      }
    };
  }, []);

  return portalContainer ? createPortal(children, portalContainer) : null;
};
