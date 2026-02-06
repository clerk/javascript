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

export type KeylessPromptState = 'default' | 'signedIn' | 'claimed' | 'success';

export interface SizingConfig {
  collapsed: {
    height: string;
    minWidth: string;
  };
  expanded: {
    height: string;
    minWidth: string;
  };
}

const COLLAPSED_PADDING_LEFT = '0.75rem';
const EXPANDED_PADDING = '0.625rem 0.75rem 0.75rem 0.75rem';

const contentTextStyles = css`
  ${basePromptElementStyles};
  color: #b4b4b4;
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1rem;
`;

const bulletListStyles = css`
  ${basePromptElementStyles};
  color: #b4b4b4;
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1rem;
  margin: 0;
  padding-left: 1.25rem;
  list-style: disc;
`;

export const STATE_SIZING_CONFIG: Record<KeylessPromptState, SizingConfig> = {
  default: {
    collapsed: {
      height: '2.5rem',
      minWidth: '15.5rem',
    },
    expanded: {
      height: '14.5rem',
      minWidth: '16.5rem',
    },
  },
  signedIn: {
    collapsed: {
      height: '2.5rem',
      minWidth: '15.75rem',
    },
    expanded: {
      height: '12rem',
      minWidth: '17rem',
    },
  },
  claimed: {
    collapsed: {
      height: '2.5rem',
      minWidth: '15.5rem',
    },
    expanded: {
      height: 'fit-content',
      minWidth: '16.5rem',
    },
  },
  success: {
    collapsed: {
      height: '2.5rem',
      minWidth: '15.5rem',
    },
    expanded: {
      height: 'fit-content',
      minWidth: '16.5rem',
    },
  },
};

const buttonIdentifierPrefix = `--clerk-keyless-prompt`;
const buttonIdentifier = `${buttonIdentifierPrefix}-button`;
const contentIdentifier = `${buttonIdentifierPrefix}-content`;

function getButtonLabel(success: boolean, claimed: boolean, isSignedIn: boolean): string {
  if (success) {
    return 'Your app is ready';
  }
  if (claimed) {
    return 'Missing environment keys';
  }
  if (isSignedIn) {
    return "You've created your first user";
  }
  return 'Configure your application';
}

function determineState(claimed: boolean, success: boolean, isSignedIn: boolean): KeylessPromptState {
  if (success) {
    return 'success';
  }
  if (claimed) {
    return 'claimed';
  }
  if (isSignedIn) {
    return 'signedIn';
  }
  return 'default';
}

function withLastActiveFallback(cb: () => string): string {
  try {
    return cb();
  } catch {
    return 'https://dashboard.clerk.com/last-active';
  }
}

const KeylessPromptInternal = (props: KeylessPromptProps) => {
  const { isSignedIn } = useUser();
  const [isExpanded, setIsExpanded] = useState(true);

  const environment = useRevalidateEnvironment();
  const claimed = Boolean(environment.authConfig.claimedAt);
  const success = typeof props.onDismiss === 'function' && claimed;
  const appName = environment.displayConfig.applicationName;
  const isSignedInBoolean = Boolean(isSignedIn);

  const state = useMemo(
    () => determineState(claimed, success, isSignedInBoolean),
    [claimed, success, isSignedInBoolean],
  );
  const sizingConfig = useMemo(() => STATE_SIZING_CONFIG[state], [state]);

  useEffect(() => {
    if (isSignedInBoolean) {
      setIsExpanded(true);
    }
  }, [isSignedInBoolean]);

  const isForcedExpanded = claimed || success || isExpanded;

  const claimUrlToDashboard = useMemo(() => {
    if (claimed) {
      return props.copyKeysUrl;
    }
    const url = new URL(props.claimUrl);
    url.searchParams.append('return_url', window.location.href);
    return url.href;
  }, [claimed, props.copyKeysUrl, props.claimUrl]);

  const instanceUrlToDashboard = useMemo(() => {
    return withLastActiveFallback(() => {
      const redirectUrlParts = handleDashboardUrlParsing(props.copyKeysUrl);
      const url = new URL(
        `${redirectUrlParts.baseDomain}/apps/${redirectUrlParts.appId}/instances/${redirectUrlParts.instanceId}/user-authentication/email-phone-username`,
      );
      return url.href;
    });
  }, [props.copyKeysUrl]);

  const mainCTAStyles = css`
    ${basePromptElementStyles};
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 1.75rem;
    padding: 0.25rem 0.625rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.12px;
    color: ${success || claimed ? 'white' : '#fde047'};
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

  return (
    <Portal>
      <PromptContainer
        data-expanded={isForcedExpanded}
        sx={t => ({
          position: 'fixed',
          bottom: '1.25rem',
          right: '1.25rem',
          height: sizingConfig.collapsed.height,
          minWidth: sizingConfig.collapsed.minWidth,
          paddingLeft: COLLAPSED_PADDING_LEFT,
          borderRadius: '1.25rem',
          transition: 'all 195ms cubic-bezier(0.2, 0.61, 0.1, 1)',

          '&[data-expanded="false"]:hover': {
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0) 100%), #1f1f1f',
          },

          '&[data-expanded="true"]': {
            flexDirection: 'column',
            alignItems: 'flex-center',
            justifyContent: 'flex-center',
            height: sizingConfig.expanded.height,
            overflow: 'hidden',
            width: 'fit-content',
            minWidth: sizingConfig.expanded.minWidth,
            paddingLeft: undefined,
            padding: EXPANDED_PADDING,
            gap: `${t.space.$1x5}`,
            borderRadius: `${t.radii.$xl}`,
            transition: 'all 230ms cubic-bezier(0.28, 1, 0.32, 1)',
          },
        })}
      >
        <button
          type='button'
          aria-expanded={isForcedExpanded}
          aria-controls={contentIdentifier}
          id={buttonIdentifier}
          onClick={() => !claimed && setIsExpanded(prev => !prev)}
          css={css`
            ${basePromptElementStyles};
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
          `}
        >
          <Flex
            sx={t => ({
              alignItems: 'center',
              gap: t.space.$2,
            })}
          >
            {success ? (
              <PromptSuccessIcon
                css={css`
                  width: 1rem;
                  height: 1rem;
                `}
              />
            ) : claimed ? (
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
            ) : (
              <div
                css={css`
                  perspective: 1000px;
                  position: relative;
                  width: 1rem;
                  height: 1rem;
                  transform-style: preserve-3d;
                  animation: ${isForcedExpanded ? 'coinFlipAnimation 12s infinite linear' : ' none'};

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
            )}

            <p
              data-text='Configure your application'
              aria-label={getButtonLabel(success, claimed, isSignedInBoolean)}
              css={css`
                ${basePromptElementStyles};
                color: #d9d9d9;
                font-size: 0.875rem;
                font-weight: 500;
                white-space: nowrap;
                cursor: pointer;
              `}
            >
              {getButtonLabel(success, claimed, isSignedInBoolean)}
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
          })}
        >
          <div
            role='region'
            id={contentIdentifier}
            aria-labelledby={buttonIdentifier}
            hidden={!isForcedExpanded}
          >
            <div
              css={css`
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                color: #b4b4b4;
                max-width: 15rem;
                animation: ${isForcedExpanded && 'show-description 500ms ease-in forwards'};
                @keyframes show-description {
                  0%,
                  5% {
                    opacity: 0;
                  }
                  12%,
                  100% {
                    opacity: 1;
                  }
                }
              `}
            >
              {success ? (
                <p css={contentTextStyles}>
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
                      line-height: inherit;
                    `}
                  >
                    {appName}
                  </span>{' '}
                  has been configured. You may now customize your settings in the{' '}
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
                    Clerk dashboard
                  </Link>
                  .
                </p>
              ) : claimed ? (
                <p css={contentTextStyles}>
                  You claimed this application but haven&apos;t set keys in your environment. Get them from the Clerk
                  Dashboard.
                </p>
              ) : isSignedInBoolean ? (
                <>
                  <p css={contentTextStyles}>
                    Head to the dashboard to customize authentication settings, view user info, and explore more
                    features.
                  </p>
                  <ul css={bulletListStyles}>
                    <li>Add SSO connections (eg. GitHub)</li>
                    <li>Set up B2B authentication</li>
                    <li>Enable MFA</li>
                  </ul>
                </>
              ) : (
                <>
                  <p
                    css={css`
                      ${contentTextStyles};
                      text-wrap: pretty;
                    `}
                  >
                    Temporary API keys are enabled so you can get started immediately.
                  </p>
                  <ul css={bulletListStyles}>
                    <li>Add SSO connections (eg. GitHub)</li>
                    <li>Set up B2B authentication</li>
                    <li>Enable MFA</li>
                  </ul>
                  <p
                    css={css`
                      ${contentTextStyles};
                      text-wrap: pretty;
                    `}
                  >
                    Access the dashboard to customize auth settings and explore Clerk features.
                  </p>
                </>
              )}
            </div>
          </div>

          {isForcedExpanded &&
            (success ? (
              <button
                type='button'
                onClick={async () => {
                  await props.onDismiss?.();
                  window.location.reload();
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
                data-expanded={isForcedExpanded}
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
                    animation: ${isForcedExpanded && isSignedInBoolean
                      ? 'show-main-CTA 800ms ease forwards'
                      : 'show-main-CTA 650ms ease-in forwards'};

                    @keyframes show-main-CTA {
                      0%,
                      5% {
                        opacity: 0;
                      }
                      14%,
                      100% {
                        opacity: 1;
                      }
                    }

                    &:hover {
                      ${claimed
                        ? `
                  background: #4B4B4B;
                  transition: all 120ms ease-in-out;`
                        : `
                  box-shadow:
                    0px 0px 6px 0px rgba(253, 224, 71, 0.24) inset,
                    0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
                    0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
                    0px 0px 0px 1px rgba(0, 0, 0, 0.12),
                    0px 1.5px 2px 0px rgba(0, 0, 0, 0.48);`}
                    }
                  `}
                >
                  {claimed ? 'Get API keys' : 'Configure your application'}
                </a>
              </Flex>
            ))}
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

  return portalContainer ? createPortal(children, portalContainer) : null;
};
