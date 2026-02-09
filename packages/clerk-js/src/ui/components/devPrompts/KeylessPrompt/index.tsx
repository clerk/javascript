import { useUser } from '@clerk/shared/react';
// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/react';
import type { PropsWithChildren } from 'react';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { Flex } from '../../../customizables';
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

  useEffect(() => {
    if (isSignedIn) {
      setIsExpanded(true);
    }
  }, [isSignedIn]);

  const environment = useRevalidateEnvironment();
  const claimed = Boolean(environment.authConfig.claimedAt);
  const success = typeof _props.onDismiss === 'function' && claimed;
  const appName = environment.displayConfig.applicationName;

  // Mock state to 'idle' for now
  const currentState: keyof typeof STATES = 'idle';
  const content = getContent(currentState);

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
          transition: 'all 195ms cubic-bezier(0.2, 0.61, 0.1, 1)',

          '&[data-expanded="false"]:hover': {
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0) 100%), #1f1f1f',
          },

          '&[data-expanded="true"]': {
            flexDirection: 'column',
            alignItems: 'flex-center',
            justifyContent: 'flex-center',
            height: claimed || success ? 'fit-content' : isSignedIn ? '8.5rem' : '12rem',
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
              data-text={content.title}
              aria-label={content.ariaLabel}
              css={css`
                ${basePromptElementStyles};
                color: #d9d9d9;
                font-size: 0.875rem;
                font-weight: 500;
                white-space: nowrap;
                cursor: pointer;
              `}
            >
              {content.title}
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
              {renderDescription(content.description)}
            </div>
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
                  {content.buttonText}
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

const WIDTH_OPEN = '18rem';
const WIDTH_CLOSED = '14.25rem';
const DURATION_OPEN = '220ms';
const DURATION_CLOSE = '180ms';
const EASE_BEZIER = 'cubic-bezier(0.2, 0, 0, 1)';
const CSS_RESET = css`
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background: none;
  border: none;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    avenir next,
    avenir,
    segoe ui,
    helvetica neue,
    helvetica,
    Cantarell,
    Ubuntu,
    roboto,
    noto,
    arial,
    sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  text-decoration: none;
  color: inherit;
  appearance: none;
`;

const getDuration = (isOpen: boolean) => (isOpen ? DURATION_OPEN : DURATION_CLOSE);

type STATES = 'idle' | 'userCreated' | 'completed';

/**
 * Content structure for each state in the KeylessPrompt component.
 * Each state maps to UI content including title, description, and button text.
 */
type ContentItem = {
  triggerWidth: string;
  title: string;
  description: React.ReactNode | ((...args: any[]) => React.ReactNode);
  buttonText: string;
};

const CONTENT: Record<STATES, ContentItem> = {
  idle: {
    triggerWidth: '14.25rem',
    title: 'Configure your application',
    description: (
      <>
        <p>Temporary API keys are enabled so you can get started immediately.</p>
        <ul>
          {['Add SSO connections (eg. GitHub)', 'Set up B2B authentication', 'Enable MFA'].map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>Access the dashboard to customize auth settings and explore Clerk features.</p>
      </>
    ),
    buttonText: 'Confirgure your application',
  },
  userCreated: {
    triggerWidth: '15.75rem',
    title: "You've created your first user!",
    description: (
      <>
        <p>Head to the dashboard to customize authentication settings, view user info, and explore more features.</p>
        <ul>
          {['Add SSO connections (eg. GitHub)', 'Set up B2B authentication', 'Enable MFA'].map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    ),
    buttonText: 'Configure your application',
  },
  completed: {
    triggerWidth: '10.5rem',
    title: 'Your app is ready',
    description: (appName: string, instanceUrlToDashboard: string) => (
      <p>
        Your application{' '}
        <a
          href={instanceUrlToDashboard}
          target='_blank'
          rel='noopener noreferrer'
        >
          {appName}
        </a>{' '}
        has been configured. You may now customize your settings in the Clerk dashboard.
      </p>
    ),
    buttonText: 'Dismiss',
  },
};

/**
 * Determines the current state based on component props and environment.
 * You can modify this logic to match your state management needs.
 */
const getCurrentState = (claimed: boolean, success: boolean, isSignedIn: boolean): STATES => {
  return 'completed';
  if (success) {
    return 'completed';
  }
  if (claimed) {
    return 'completed';
  }
  if (isSignedIn) {
    return 'userCreated';
  }
  return 'idle';
};

/**
 * Gets the content object for a given state.
 */
const getContent = (state: STATES) => CONTENT[state];

/**
 * Renders the description content, handling both ReactNode and function cases.
 * For function descriptions, pass the required parameters.
 */
const renderDescription = (description: ContentItem['description'], ...args: any[]): React.ReactNode => {
  if (typeof description === 'function') {
    return description(...args);
  }
  return description;
};

function Keyless() {
  const id = React.useId();

  const claimed = false;
  const success = false;
  const isSignedIn = false;
  const appName = 'My App';
  const instanceUrlToDashboard = 'https://dashboard.clerk.com';

  const [isOpen, setIsOpen] = useState(false);
  const currentState = getCurrentState(claimed, success, isSignedIn);

  const title = getContent(currentState).title;
  const description = renderDescription(getContent(currentState).description, appName, instanceUrlToDashboard);
  const buttonText = getContent(currentState).buttonText;
  const triggerWidth = getContent(currentState).triggerWidth;

  return (
    <div
      data-expanded={isOpen}
      css={css`
        ${CSS_RESET};
        position: fixed;
        bottom: 1.25rem;
        right: 1.25rem;
        border-radius: ${isOpen ? '0.75rem' : '2.5rem'};
        background-color: #1f1f1f;
        box-shadow:
          0px 0px 0px 0.5px #2f3037 inset,
          0px 1px 0px 0px rgba(255, 255, 255, 0.08) inset,
          0px 0px 0.8px 0.8px rgba(255, 255, 255, 0.2) inset,
          0px 0px 0px 0px rgba(255, 255, 255, 0.72),
          0px 16px 36px -6px rgba(0, 0, 0, 0.36),
          0px 6px 16px -2px rgba(0, 0, 0, 0.2);
        height: auto;
        isolation: isolate;
        transform: translateZ(0);
        backface-visibility: hidden;
        width: ${isOpen ? WIDTH_OPEN : triggerWidth};
        transition:
          border-radius ${getDuration(isOpen)} cubic-bezier(0.2, 0, 0, 1),
          width ${getDuration(isOpen)} ${EASE_BEZIER};
        &:has(button:focus-visible) {
          outline: 2px solid #6c47ff;
          outline-offset: 2px;
        }
        &::before {
          content: '';
          pointer-events: none;
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background-image: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
          opacity: 0.16;
          transition: opacity ${getDuration(isOpen)} ${EASE_BEZIER};
        }
        &[data-expanded='true']::before,
        &:hover::before {
          opacity: 0.2;
        }
      `}
    >
      <button
        type='button'
        aria-controls={id}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(p => !p)}
        css={css`
          ${CSS_RESET};
          display: flex;
          align-items: center;
          width: 100%;
          border-radius: inherit;
          padding-inline: 0.75rem;
          gap: 0.25rem;
          height: 2.5rem;
          outline: none;
          cursor: pointer;
          user-select: none;
        `}
      >
        <svg
          css={css`
            width: 1rem;
            height: 1rem;
            flex-shrink: 0;
          `}
          fill='none'
          viewBox='0 0 128 128'
        >
          <circle
            cx='64'
            cy='64'
            r='20'
            fill='#fff'
          />
          <path
            fill='#fff'
            fillOpacity='.4'
            d='M99.572 10.788c1.999 1.34 2.17 4.156.468 5.858L85.424 31.262c-1.32 1.32-3.37 1.53-5.033.678A35.846 35.846 0 0 0 64 28c-19.882 0-36 16.118-36 36a35.846 35.846 0 0 0 3.94 16.391c.851 1.663.643 3.712-.678 5.033L16.646 100.04c-1.702 1.702-4.519 1.531-5.858-.468C3.974 89.399 0 77.163 0 64 0 28.654 28.654 0 64 0c13.163 0 25.399 3.974 35.572 10.788Z'
          />
          <path
            fill='#fff'
            d='M100.04 111.354c1.702 1.702 1.531 4.519-.468 5.858C89.399 124.026 77.164 128 64 128c-13.164 0-25.399-3.974-35.572-10.788-2-1.339-2.17-4.156-.468-5.858l14.615-14.616c1.322-1.32 3.37-1.53 5.033-.678A35.847 35.847 0 0 0 64 100a35.846 35.846 0 0 0 16.392-3.94c1.662-.852 3.712-.643 5.032.678l14.616 14.616Z'
          />
        </svg>
        <span
          css={css`
            ${CSS_RESET};
            font-size: 0.875rem;
            font-weight: 500;
            color: #d9d9d9;
            white-space: nowrap;
          `}
        >
          {title}
        </span>
        <svg
          css={css`
            width: 1rem;
            height: 1rem;
            flex-shrink: 0;
            color: #d9d9d9;
            margin-inline-start: auto;
            opacity: ${isOpen ? 1 : 0};
            transition: opacity ${getDuration(isOpen)} ease-out;
          `}
          viewBox='0 0 16 16'
          fill='none'
          aria-hidden='true'
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
      </button>
      <div
        id={id}
        {...(!isOpen && { inert: '' as any })}
        css={css`
          ${CSS_RESET};
          display: grid;
          grid-template-rows: ${isOpen ? '1fr' : '0fr'};
          transition: grid-template-rows ${getDuration(isOpen)} ${EASE_BEZIER};
        `}
      >
        <div
          css={css`
            ${CSS_RESET};
            min-height: 0;
            overflow: hidden;
          `}
        >
          <div
            css={css`
              ${CSS_RESET};
              width: ${WIDTH_OPEN};
              padding-inline: 0.75rem;
              padding-block-end: 0.75rem;
              opacity: ${isOpen ? 1 : 0};
              transition: opacity ${getDuration(isOpen)} ${EASE_BEZIER};
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
              & p {
                ${CSS_RESET};
                color: #b4b4b4;
                font-size: 0.8125rem;
                font-weight: 400;
                line-height: 1rem;
                text-wrap: pretty;
              }
              & ul {
                ${CSS_RESET};
                list-style: disc;
                padding-left: 1rem;
              }
              & li {
                ${CSS_RESET};
                color: #b4b4b4;
                font-size: 0.8125rem;
                font-weight: 400;
                line-height: 1rem;
                text-wrap: pretty;
              }
              & a {
                color: #fde047;
                font-weight: 500;
                outline: none;
                &:focus-visible {
                  outline: 2px solid #6c47ff;
                  outline-offset: 2px;
                }
              }
            `}
          >
            {description}

            <a
              href='https://clerk.com/dashboard'
              target='_blank'
              rel='noopener noreferrer'
              css={css`
                ${CSS_RESET};
                margin: 0.75rem 0 0;
                box-sizing: border-box;
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
                color: #fde047;
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
                outline: none;
                &:hover {
                  background: #4b4b4b;
                  transition: background-color 120ms ease-in-out;
                }
                &:focus-visible {
                  outline: 2px solid #6c47ff;
                  outline-offset: 2px;
                }
              `}
            >
              {buttonText}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export const KeylessPrompt = (props: KeylessPromptProps) => (
  <InternalThemeProvider>
    <Keyless />
    {/* <KeylessPromptInternal {...props} /> */}
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
