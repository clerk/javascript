// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/react';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Flex, Link } from '../../customizables';
import { Portal } from '../../elements/Portal';
import { InternalThemeProvider } from '../../styledSystem';
import { ClerkLogoIcon } from './ClerkLogoIcon';
import { KeySlashIcon } from './KeySlashIcon';
import { useRevalidateEnvironment } from './use-revalidate-environment';

type KeylessPromptProps = {
  claimUrl: string;
  copyKeysUrl: string;
};

const buttonIdentifierPrefix = `--clerk-keyless-prompt`;
const buttonIdentifier = `${buttonIdentifierPrefix}-button`;
const contentIdentifier = `${buttonIdentifierPrefix}-content`;

const _KeylessPrompt = (_props: KeylessPromptProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const claimed = Boolean(useRevalidateEnvironment().authConfig.claimedAt);

  const isForcedExpanded = claimed || isExpanded;

  const baseElementStyles = css`
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    background: none;
    border: none;
    line-height: 1.5;
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
    text-decoration: none;
  `;

  return (
    <Portal>
      <Flex
        data-expanded={isForcedExpanded}
        sx={t => ({
          position: 'fixed',
          bottom: '1.25rem',
          right: '1.25rem',
          zIndex: t.zIndices.$fab,
          height: `${t.sizes.$10}`,
          minWidth: '13.4rem',
          paddingLeft: `${t.space.$3}`,
          borderRadius: '1.25rem',
          fontFamily: t.fonts.$main,
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 100%), #1f1f1f',
          boxShadow:
            '0px 0px 0px 0.5px #2f3037 inset, 0px 1px 0px 0px rgba(255, 255, 255, 0.08) inset, 0px 0px 1px 1px rgba(255, 255, 255, 0.15) inset, 0px 0px 1px 0px rgba(255, 255, 255, 0.72), 0px 16px 36px -6px rgba(0, 0, 0, 0.36), 0px 6px 16px -2px rgba(0, 0, 0, 0.2)',
          transition: 'all 210ms cubic-bezier(0.2, 0.9, 0.25, 1)',

          '&[data-expanded="false"]:hover': {
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0) 100%), #1f1f1f',
          },

          '&[data-expanded="true"]': {
            flexDirection: 'column',
            alignItems: 'flex-center',
            justifyContent: 'flex-center',
            height: '8.75rem',
            overflow: 'hidden',
            width: 'fit-content',
            minWidth: '16.125rem',
            gap: `${t.space.$1x5}`,
            padding: `${t.space.$2x5} ${t.space.$3} ${t.space.$3} ${t.space.$3}`,
            borderRadius: `${t.radii.$xl}`,
            transition: 'all 220ms cubic-bezier(0.25, 0.8, 0.25, 1)',
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
            ${baseElementStyles};
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
            {claimed ? (
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
              aria-label={claimed ? 'Missing environment keys' : 'Clerk is in keyless mode'}
              css={css`
                ${baseElementStyles};
                color: #d9d9d9;
                font-size: 0.875rem;
                font-weight: 500;
                position: relative;
                isolation: isolate;
                white-space: nowrap;
                cursor: pointer;

                ${!claimed &&
                `&::after {
                  content: attr(data-text);
                  z-index: 1;
                  position: absolute;
                  left: 0;
                  top: 0;
                  color: transparent;
                  background: linear-gradient(
                    -100deg,
                    transparent 0%,
                    transparent 45%,
                    rgb(198, 179, 86) 51%,
                    rgb(198, 179, 86) 55%,
                    transparent 60%,
                    transparent 100%
                  );
                  background-size: 260% 100%;
                  background-clip: text;
                  filter: blur(1.2px);
                 animation: text-shimmer 12s 1s 1 ease-out forwards;
                  -webkit-user-select: none;
                  user-select: none;
                }

                &::before {
                  z-index: 2;
                  content: attr(data-text);
                  position: absolute;
                  left: 0;
                  top: 0;
                  color: transparent;
                  background: linear-gradient(
                    -100deg,
                    transparent 0%,
                    transparent 45%,
                    rgba(240, 214, 83, 0.7) 50%,
                    rgb(240, 214, 83) 51%,
                    rgb(240, 214, 83) 55%,
                    rgba(240, 214, 83, 0.7) 60%,
                    transparent 65%,
                    transparent 100%
                  );
                  background-size: 260% 100%;
                  background-clip: text;
                 animation: text-shimmer 12s 1s 1 ease-out forwards;
                  -webkit-user-select: none;
                  user-select: none;
                }

                @media (prefers-reduced-motion: reduce) {
                  &::after,
                  &::before {
                    animation: none;
                    background: transparent;
                  }
                }

				  @keyframes text-shimmer {
                  0% {
                    background-position: 120% center;
                  }
                  15% {
                    background-position: -60% center;
                  }
                  85% {
                    background-position: -60% center;
                  }
                  100% {
                    background-position: -60% center;
                  }
                }
              `};
              `}
            >
              {claimed ? 'Missing environment keys' : 'Clerk is in keyless mode'}
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
              transition: color 130ms ease-out;
              display: ${isExpanded && !claimed ? 'block' : 'none'};

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
                ${baseElementStyles};
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
              {claimed ? (
                <>
                  You claimed this application but haven&apos;t set keys in your environment. Get them from the Clerk
                  Dashboard.
                </>
              ) : (
                <>
                  We generated temporary API keys for you. Link this instance to your Clerk account to configure it.{' '}
                  <Link
                    isExternal
                    aria-label='Learn more about Clerk keyless mode'
                    href='https://clerk.com/docs/keyless'
                    sx={t => ({
                      color: t.colors.$whiteAlpha600,
                      textDecoration: 'underline solid',
                      transition: `${t.transitionTiming.$common} ${t.transitionDuration.$fast}`,
                      ':hover': {
                        color: t.colors.$whiteAlpha800,
                      },
                    })}
                  >
                    Learn more
                  </Link>
                </>
              )}
            </p>
          </div>

          {isForcedExpanded && (
            <a
              href={claimed ? _props.copyKeysUrl : _props.claimUrl}
              target='_blank'
              rel='noopener noreferrer'
              data-expanded={isForcedExpanded}
              css={css`
                ${baseElementStyles};
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
                color: ${claimed ? 'white' : '#fde047'};
                text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.32);
                white-space: nowrap;
                user-select: none;
                background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30.5%, rgba(0, 0, 0, 0.05) 100%), #454545;
                box-shadow:
                  0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
                  0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
                  0px 0px 0px 1px rgba(0, 0, 0, 0.12),
                  0px 1.5px 2px 0px rgba(0, 0, 0, 0.48),
                  0px 0px 4px 0px rgba(243, 107, 22, 0) inset;

                animation: ${isForcedExpanded && 'show-button 590ms ease-in forwards'};
                @keyframes show-button {
                  0%,
                  8% {
                    opacity: 0;
                  }
                  21%,
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
              {claimed ? 'Get API keys' : 'Claim keys'}
            </a>
          )}
        </Flex>
      </Flex>
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
    <_KeylessPrompt {...props} />
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
