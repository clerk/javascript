import { useUser } from '@clerk/shared/react';
// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/react';
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { Flex, Link } from '../../../customizables';
import { Portal } from '../../../elements/Portal';
import { InternalThemeProvider } from '../../../styledSystem';
import { basePromptElementStyles, PromptContainer } from '../shared';
import { ClerkLogoIcon } from './ClerkLogoIcon';
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

function handleDashboardUrlParsing(url: string) {
  // make sure this is a valid url
  const __url = new URL(url);
  const regex = /^https?:\/\/(.*?)\/apps\/app_(.+?)\/instances\/ins_(.+?)(?:\/.*)?$/;

  const match = __url.href.match(regex);

  if (!match) {
    throw new Error('invalid value dashboard url structure');
  }

  // Extracting base domain, app ID with prefix, and instanceId with prefix
  return {
    baseDomain: `https://${match[1]}`,
    appId: `app_${match[2]}`,
    instanceId: `ins_${match[3]}`,
  };
}

const KeylessPromptInternal = (_props: KeylessPromptProps) => {
  const { isSignedIn } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      setIsExpanded(true);
    }
  }, [isSignedIn]);

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

  const getKeysUrlFromLastActive = useMemo(() => {
    return withLastActiveFallback(() => {
      const redirectUrlParts = handleDashboardUrlParsing(_props.copyKeysUrl);
      const url = new URL(`${redirectUrlParts.baseDomain}/last-active?path=api-keys`);
      return url.href;
    });
  }, [_props.copyKeysUrl]);

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
    color: ${claimed ? 'white' : success ? 'white' : '#fde047'};
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
          height: `${t.sizes.$10}`,
          minWidth: '13.4rem',
          paddingLeft: `${t.space.$3}`,
          borderRadius: '1.25rem',

          '&[data-expanded="false"]:hover': {
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0) 100%), #1f1f1f',
          },

          '&[data-expanded="true"]': {
            flexDirection: 'column',
            alignItems: 'flex-center',
            justifyContent: 'flex-center',
            height: claimed || success ? 'fit-content' : isSignedIn ? '11rem' : '12rem',
            overflow: 'hidden',
            width: 'fit-content',
            minWidth: '16.125rem',
            gap: `${t.space.$1x5}`,
            padding: `${t.space.$2x5} ${t.space.$3} ${t.space.$3} ${t.space.$3}`,
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
              <svg
                width='1rem'
                height='1rem'
                viewBox='0 0 16 17'
                fill='none'
                aria-hidden
                xmlns='http://www.w3.org/2000/svg'
              >
                <g opacity='0.88'>
                  <path
                    d='M13.8002 8.20039C13.8002 8.96206 13.6502 9.71627 13.3587 10.42C13.0672 11.1236 12.64 11.763 12.1014 12.3016C11.5628 12.8402 10.9234 13.2674 10.2198 13.5589C9.51607 13.8504 8.76186 14.0004 8.0002 14.0004C7.23853 14.0004 6.48432 13.8504 5.78063 13.5589C5.07694 13.2674 4.43756 12.8402 3.89898 12.3016C3.3604 11.763 2.93317 11.1236 2.64169 10.42C2.35022 9.71627 2.2002 8.96206 2.2002 8.20039C2.2002 6.66214 2.81126 5.18688 3.89898 4.09917C4.98669 3.01146 6.46194 2.40039 8.0002 2.40039C9.53845 2.40039 11.0137 3.01146 12.1014 4.09917C13.1891 5.18688 13.8002 6.66214 13.8002 8.20039Z'
                    fill='#22C543'
                    fillOpacity='0.16'
                  />
                  <path
                    d='M6.06686 8.68372L7.51686 10.1337L9.93353 6.75039M13.8002 8.20039C13.8002 8.96206 13.6502 9.71627 13.3587 10.42C13.0672 11.1236 12.64 11.763 12.1014 12.3016C11.5628 12.8402 10.9234 13.2674 10.2198 13.5589C9.51607 13.8504 8.76186 14.0004 8.0002 14.0004C7.23853 14.0004 6.48432 13.8504 5.78063 13.5589C5.07694 13.2674 4.43756 12.8402 3.89898 12.3016C3.3604 11.763 2.93317 11.1236 2.64169 10.42C2.35022 9.71627 2.2002 8.96206 2.2002 8.20039C2.2002 6.66214 2.81126 5.18688 3.89898 4.09917C4.98669 3.01146 6.46194 2.40039 8.0002 2.40039C9.53845 2.40039 11.0137 3.01146 12.1014 4.09917C13.1891 5.18688 13.8002 6.66214 13.8002 8.20039Z'
                    stroke='#22C543'
                    strokeWidth='1.2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </g>
              </svg>
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
              data-text='Clerk is in keyless mode'
              aria-label={
                success ? 'Claim completed' : claimed ? 'Missing environment keys' : 'Clerk is in keyless mode'
              }
              css={css`
                ${basePromptElementStyles};
                color: #d9d9d9;
                font-size: 0.875rem;
                font-weight: 500;
                white-space: nowrap;
                cursor: pointer;
              `}
            >
              {success ? 'Claim completed' : claimed ? 'Missing environment keys' : 'Clerk is in keyless mode'}
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
            <p
              css={css`
                ${basePromptElementStyles};
                color: #b4b4b4;
                font-size: 0.8125rem;
                font-weight: 400;
                line-height: 1rem;
                max-width: 14.625rem;
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
                <>
                  Your application{' '}
                  <span
                    css={css`
                      display: inline-block;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      max-width: 8.125rem;
                      vertical-align: bottom;
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
                </>
              ) : claimed ? (
                <>
                  You claimed this application but haven&apos;t set keys in your environment. Get them from the Clerk
                  Dashboard.
                </>
              ) : (
                <span>
                  {isSignedIn
                    ? "You've created your first user! Link this application to your Clerk account to explore the Dashboard."
                    : 'This app uses Clerk for authentication. We generated temporary API keys for you. Link this application to your Clerk account to configure it.'}
                </span>
              )}
            </p>
          </div>

          {isForcedExpanded &&
            (success ? (
              <button
                type='button'
                onClick={async () => {
                  await _props.onDismiss?.();
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
                    animation: ${isForcedExpanded && isSignedIn
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
                  {claimed ? 'Get API keys' : 'Claim application'}
                </a>

                {!claimed && (
                  <>
                    <span
                      css={css`
                        height: 1px;
                        background-color: #151515;
                        width: 100%;
                        box-shadow: 0px 1px 0px 0px #424242;
                      `}
                    />

                    <a
                      href={getKeysUrlFromLastActive}
                      target='_blank'
                      rel='noopener noreferrer'
                      css={css`
                        ${basePromptElementStyles};
                        color: #ffffff9e;
                        font-size: 0.75rem;
                        transition: color 120ms ease-out;

                        :hover {
                          color: #ffffffcf;
                          text-decoration: none;
                        }

                        animation: ${isForcedExpanded && isSignedIn
                          ? 'show-secondary-CTA 800ms ease forwards'
                          : 'show-secondary-CTA 650ms ease-in forwards'};

                        @keyframes show-secondary-CTA {
                          0%,
                          9% {
                            opacity: 0;
                          }
                          19%,
                          100% {
                            opacity: 1;
                          }
                        }
                      `}
                    >
                      Already have a Clerk app? Get keys
                    </a>
                  </>
                )}
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

  // Render the children inside the dynamically created div
  return portalContainer ? createPortal(children, portalContainer) : null;
};
