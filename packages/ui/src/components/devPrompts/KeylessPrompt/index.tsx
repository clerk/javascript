import { useUser } from '@clerk/shared/react';
// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/react';
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { Flex, Link } from '../../../customizables';
import { Portal } from '../../../elements/Portal';
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

const KeylessPromptInternal = (_props: KeylessPromptProps) => {
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
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 200); // Match ANIMATION_DURATION
      return () => clearTimeout(timer);
    }
  }, [isAnimating, isExpanded]);

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

  // Determine CTA button color based on state
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

  // Determine CTA button hover styles
  const ctaButtonHoverStyles = claimed
    ? 'background: #4B4B4B; transition: all 120ms ease-in-out;'
    : `box-shadow:
      0px 0px 6px 0px rgba(253, 224, 71, 0.24) inset,
      0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
      0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
      0px 0px 0px 1px rgba(0, 0, 0, 0.12),
      0px 1.5px 2px 0px rgba(0, 0, 0, 0.48);`;

  // Render the appropriate icon based on state
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

  // Get the status text based on state
  function getStatusText() {
    if (success) {
      return 'Claim completed';
    }
    if (claimed) {
      return 'Missing environment keys';
    }
    return 'Clerk is in keyless mode';
  }

  // Common paragraph styles for content text
  const contentParagraphStyles = css`
    ${basePromptElementStyles};
    color: #b4b4b4;
    font-size: 0.8125rem;
    font-weight: 400;
    line-height: 1rem;
  `;

  // Title text styles - stable color that doesn't change
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
          // Enable interpolation of keyword values (fit-content, auto)
          // This is the key AIM technique for dynamic content
          interpolateSize: 'allow-keywords',

          position: 'fixed',
          bottom: '1.25rem',
          right: '1.25rem',
          // Always column direction for consistent layout during transition
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          overflow: 'clip',

          // Collapsed: static width, fixed height for title bar
          width: '13.5rem',
          height: '2.375rem',
          padding: `${t.space.$2} ${t.space.$3}`,
          borderRadius: '1.25rem',

          // AIM transition - interpolate-size handles fit-content smoothly
          // Smoother easing curve for more polished feel
          transition: `width ${ANIMATION_DURATION} cubic-bezier(0.2, 0, 0, 1),
                       height ${ANIMATION_DURATION} cubic-bezier(0.2, 0, 0, 1),
                       padding ${ANIMATION_DURATION} cubic-bezier(0.2, 0, 0, 1),
                       border-radius ${ANIMATION_DURATION} cubic-bezier(0.2, 0, 0, 1),
                       gap ${ANIMATION_DURATION} cubic-bezier(0.2, 0, 0, 1),
                       background ${ANIMATION_DURATION} cubic-bezier(0.2, 0, 0, 1)`,

          '&[data-expanded="false"]:hover': {
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0) 100%), #1f1f1f',
          },

          '&[data-expanded="true"]': {
            // Expanded: static width, dynamic height via fit-content (AIM technique)
            // interpolate-size: allow-keywords enables smooth transition to fit-content
            width: '16.125rem',
            height: 'fit-content',
            gap: `${t.space.$1x5}`,
            padding: `${t.space.$2x5} ${t.space.$3} ${t.space.$3} ${t.space.$3}`,
            borderRadius: `${t.radii.$xl}`,
          },
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
            transition: `opacity ${CONTENT_FADE_DURATION} cubic-bezier(0.2, 0, 0, 1)`,
            transitionDelay: isForcedExpanded ? CONTENT_FADE_DELAY : '0ms',
            pointerEvents: isForcedExpanded ? 'auto' : 'none',
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
                    Claim this application to access the Clerk Dashboard where you can manage auth settings and explore
                    more Clerk features.
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
                  transition: opacity ${isForcedExpanded ? CONTENT_FADE_DURATION : '80ms'} cubic-bezier(0.2, 0, 0, 1);
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

  // Render the children inside the dynamically created div
  return portalContainer ? createPortal(children, portalContainer) : null;
};
