import { useUser } from '@clerk/shared/react';
// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/react';
import React, { useMemo, useState } from 'react';

import { Link } from '../../../customizables';
import { Portal } from '../../../elements/Portal';
import { MosaicThemeProvider, useMosaicTheme } from '../../../mosaic/theme-provider';
import { InternalThemeProvider } from '../../../styledSystem';
import { handleDashboardUrlParsing } from '../shared';
import { useRevalidateEnvironment } from './use-revalidate-environment';

type KeylessPromptProps = {
  claimUrl: string;
  copyKeysUrl: string;
  onDismiss: (() => Promise<unknown>) | undefined | null;
};

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

function KeylessPromptInternal(props: KeylessPromptProps) {
  return (
    <MosaicThemeProvider>
      <KeylessPromptContent {...props} />
    </MosaicThemeProvider>
  );
}

function KeylessPromptContent(props: KeylessPromptProps) {
  const { isSignedIn } = useUser();
  const environment = useRevalidateEnvironment();
  const claimed = Boolean(environment.authConfig.claimedAt);
  const success = typeof props.onDismiss === 'function' && claimed;
  const appName = environment.displayConfig.applicationName;
  const isLocked = claimed || success;

  const [isOpen, setIsOpen] = useState(isSignedIn || isLocked);
  const [hasMounted, setHasMounted] = useState(false);
  const id = React.useId();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const theme = useMosaicTheme();

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  React.useEffect(() => {
    if (hasMounted && isSignedIn) {
      setIsOpen(true);
    }
  }, [hasMounted, isSignedIn]);

  React.useEffect(() => {
    if (isLocked) {
      setIsOpen(true);
    }
  }, [isLocked]);

  const claimUrlToDashboard = useMemo(() => {
    if (claimed) {
      return props.copyKeysUrl;
    }

    const url = new URL(props.claimUrl);
    // Clerk Dashboard accepts a `return_url` query param when visiting `/apps/claim`.
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

  function getStatusText() {
    if (success) {
      return 'Claim completed';
    }
    if (claimed) {
      return 'Missing environment keys';
    }
    return 'Clerk is in keyless mode';
  }

  React.useEffect(() => {
    if (isLocked) {
      return;
    }

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
  }, [isOpen, isLocked]);

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
          font-family: var(--font-family);
          box-sizing: border-box;
          margin: 0;
          padding: 0;
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
          transition: ${hasMounted
            ? `width ${isOpen ? 'var(--duration-open)' : 'var(--duration-close)'} var(--ease-bezier), border-radius var(--duration-open) var(--ease-bezier)`
            : 'none'};
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
            transition: ${hasMounted
              ? `opacity ${isOpen ? 'var(--duration-open)' : 'var(--duration-close)'} var(--ease-bezier)`
              : 'none'};
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
          onClick={() => {
            if (!isLocked) {
              setIsOpen(prev => !prev);
            }
          }}
          aria-expanded={isOpen}
          aria-controls={id}
          css={css`
            box-sizing: border-box;
            appearance: none;
            border: none;
            background-color: transparent;
            display: flex;
            align-items: center;
            width: 100%;
            border-radius: inherit;
            padding-block: ${theme.spacing[3]};
            margin: 0;
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
              css={{
                width: theme.spacing[4],
                height: theme.spacing[4],
                flexShrink: 0,
                color: 'var(--foreground)',
              }}
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
            {getStatusText()}
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
          {!isLocked && (
            <svg
              viewBox='0 0 16 16'
              fill='none'
              aria-hidden='true'
              css={css`
                flex-shrink: 0;
                width: ${theme.spacing[4]};
                height: ${theme.spacing[4]};
                color: var(--foreground);
                margin-inline-start: auto;
                margin-inline-end: ${theme.spacing[3]};
                opacity: ${isOpen ? 0.6 : 0};
                transform: translateX(${isOpen ? '0' : theme.spacing[6]});
                transition:
                  opacity 120ms ease-out,
                  transform
                    ${hasMounted ? `${isOpen ? 'var(--duration-open)' : 'var(--duration-close)'} ease-out` : 'none'};
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
          )}
        </button>

        <div
          id={id}
          css={css`
            display: grid;
            grid-template-rows: ${isOpen ? '1fr' : '0fr'};
            transition: ${hasMounted
              ? `grid-template-rows ${isOpen ? 'var(--duration-open)' : 'var(--duration-close)'} var(--ease-bezier)`
              : 'none'};
            @media (prefers-reduced-motion: reduce) {
              transition: none;
            }
          `}
          {...(!isOpen && { inert: true })}
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
                transition: ${hasMounted
                  ? `opacity ${isOpen ? 'var(--duration-open)' : 'var(--duration-close)'} var(--ease-bezier), filter ${isOpen ? 'var(--duration-open)' : 'var(--duration-close)'} var(--ease-bezier)`
                  : 'none'};
                @media (prefers-reduced-motion: reduce) {
                  transition: none;
                }
              `}
            >
              <div
                css={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.spacing[2],
                  color: 'var(--foreground-secondary)',
                  fontFamily: 'var(--font-family)',
                  fontSize: theme.typography.body[3].fontSize,
                  lineHeight: theme.typography.body[3].lineHeight,
                  fontWeight: theme.typography.body[3].fontWeight,
                  '& > p': {
                    boxSizing: 'border-box',
                    margin: 0,
                    padding: 0,
                    textBoxTrim: 'trim-both',
                  },
                }}
              >
                {success ? (
                  <p>
                    Your application{' '}
                    <span
                      css={css`
                        display: inline-block;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 8.125rem;
                        vertical-align: bottom;
                        font-weight: ${theme.fontWeights.medium};
                        color: var(--foreground);
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
                  <p>
                    You claimed this application but haven&apos;t set keys in your environment. Get them from the Clerk
                    Dashboard.
                  </p>
                ) : isSignedIn ? (
                  <p>
                    You&apos;ve created your first user! Link this application to your Clerk account to explore the
                    Dashboard.
                  </p>
                ) : (
                  <>
                    <p>Temporary API keys are enabled so you can get started immediately.</p>
                    <p>
                      Claim this application to access the Clerk Dashboard where you can manage auth settings and
                      explore more Clerk features.
                    </p>
                  </>
                )}
              </div>
              {success ? (
                <button
                  type='button'
                  onClick={() => {
                    void props.onDismiss?.().then(() => {
                      window.location.reload();
                    });
                  }}
                  css={css`
                    box-sizing: border-box;
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
                    border: none;
                    margin: 0;
                    padding: 0;
                    cursor: pointer;
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
                    &:hover {
                      background: ${theme.colors.gray[1200]};
                      transition: all 120ms ease-in-out;
                    }
                  `}
                >
                  <span
                    css={css`
                      position: relative;
                      z-index: 1;
                    `}
                  >
                    Dismiss
                  </span>
                </button>
              ) : (
                <a
                  href={claimUrlToDashboard}
                  target='_blank'
                  rel='noopener noreferrer'
                  css={css`
                    box-sizing: border-box;
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
                    margin: 0;
                    padding: 0;
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
                    {claimed ? 'Get API keys' : 'Claim application'}
                  </span>
                  <svg
                    css={{
                      width: theme.spacing[2.5],
                      height: theme.spacing[2.5],
                      flexShrink: 0,
                      opacity: 0.6,
                    }}
                    viewBox='0 0 10 10'
                    aria-hidden='true'
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
              )}
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
