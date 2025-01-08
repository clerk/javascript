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
  const [isExpanded, setIsExpanded] = useState(true);
  const claimed = Boolean(useRevalidateEnvironment().authConfig.claimedAt);

  return (
    <Portal>
      <Flex
        data-expanded={isExpanded}
        align='center'
        sx={t => ({
          position: 'fixed',
          bottom: '1.25rem',
          right: '1.25rem',
          zIndex: t.zIndices.$fab,
          height: `${t.sizes.$10}`,
          minWidth: '18.5625rem',
          maxWidth: 'fit-content',
          padding: `${t.space.$1x5} ${t.space.$1x5} ${t.space.$1x5} ${t.space.$3}`,
          borderRadius: '1.25rem',
          fontFamily: t.fonts.$main,
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 100%), #1f1f1f',
          boxShadow:
            '0px 0px 0px 0.5px #2f3037 inset, 0px 1px 0px 0px rgba(255, 255, 255, 0.08) inset, 0px 0px 1px 1px rgba(255, 255, 255, 0.15) inset, 0px 0px 1px 0px rgba(255, 255, 255, 0.72), 0px 16px 36px -6px rgba(0, 0, 0, 0.36), 0px 6px 16px -2px rgba(0, 0, 0, 0.2)',
          transition: 'all 325ms cubic-bezier(0.18, 0.98, 0.1, 1)',

          '&[data-expanded="true"]': {
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            height: 'fit-content',
            width: 'fit-content',
            minWidth: '16.125rem',
            gap: `${t.space.$1x5}`,
            padding: `${t.space.$2x5} ${t.space.$3} 3.25rem ${t.space.$3}`,
            borderRadius: `${t.radii.$xl}`,
            transition: 'all 205ms cubic-bezier(0.4, 1, 0.20, 0.9)',
          },
        })}
      >
        <button
          type='button'
          aria-expanded={isExpanded}
          aria-controls={contentIdentifier}
          id={buttonIdentifier}
          onClick={() => !claimed && setIsExpanded(prev => !prev)}
          css={css`
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
                  animation: ${isExpanded ? 'coinFlipAnimation 12s infinite linear' : ' none'};

                  @keyframes coinFlipAnimation {
                    0%,
                    70% {
                      transform: rotateY(0);
                    }
                    75%,
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
              aria-label={claimed && isExpanded ? 'Missing environment keys' : 'Clerk is in keyless mode'}
              css={css`
                color: #d9d9d9;
                font-size: 0.875rem;
                font-weight: 500;
                position: relative;
                isolation: isolate;
                white-space: nowrap;
                animation: show-title 160ms ease-out forwards;

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
                  background-size: 180% 100%;
                  background-clip: text;
                  filter: blur(1.2px);
                  animation: ${
                    isExpanded
                      ? 'text-shimmer-expanded 3s infinite ease-out forwards'
                      : 'text-shimmer 3s infinite ease-out forwards'
                  };
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
                  background-size: 180% 100%;
                  background-clip: text;
                  animation: ${
                    isExpanded
                      ? 'text-shimmer-expanded 3s infinite ease-out forwards'
                      : 'text-shimmer 3s infinite ease-out forwards'
                  };
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
                  30%,
                  100% {
                    background-position: -60% center;
                  }
                }

                @keyframes text-shimmer-expanded {
                  0% {
                    background-position: 120% center;
                  }
                  30%,
                  100% {
                    background-position: -60% center;
                  }
                }
              `} @keyframes show-title {
                  from {
                    transform: translateY(-1.5px);
                    opacity: 0;
                  }

                  to {
                    transform: translateY(0);
                    opacity: 1;
                  }
                }
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
              visibility: ${isExpanded && !claimed ? 'visible' : 'hidden'};

              :hover {
                color: #eeeeee;
              }

              animation: show-button 285ms cubic-bezier(0.4, 0, 0, 1.1) forwards;

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

        <div
          role='region'
          id={contentIdentifier}
          aria-labelledby={buttonIdentifier}
          hidden={!isExpanded}
        >
          <p
            css={css`
              color: #b4b4b4;
              font-size: 0.8125rem;
              font-weight: 400;
              line-height: 1rem;
              max-width: 14.625rem;
              min-height: 2rem;
              animation: show-description 208ms ease forwards;

              @keyframes show-description {
                from {
                  transform: translateY(-1.5px);
                  opacity: 0;
                }
                to {
                  transform: translateY(0);
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

        <a
          href={claimed ? _props.copyKeysUrl : _props.claimUrl}
          rel='noopener noreferrer'
          data-expanded={isExpanded}
          css={css`
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            right: 0.375rem;
            bottom: 0.375rem;
            height: 1.75rem;
            width: 5.125rem;
            max-width: 14.625rem;
            padding: 0.25rem 0.625rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 500;
            letter-spacing: 0.12px;
            color: white;
            text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.32);
            white-space: nowrap;
            cursor: pointer;
            user-select: none;
            background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30.5%, rgba(0, 0, 0, 0.05) 100%), #636363;
            box-shadow:
              0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
              0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
              0px 0px 0px 1px rgba(0, 0, 0, 0.12),
              0px 1.5px 2px 0px rgba(0, 0, 0, 0.48),
              0px 0px 4px 0px rgba(243, 107, 22, 0) inset;

            transition: all 138ms cubic-bezier(0.09, 0.7, 0.1, 1);
            animation: small-btn-glow 3s infinite 500ms;

            @media (prefers-reduced-motion: reduce) {
              animation: none;
            }

            &[data-expanded='true'] {
              right: 0.75rem;
              bottom: 0.75rem;
              width: calc(100% - 1.5rem);
              color: ${claimed ? 'white' : '#fde047'};
              border-radius: 0.375rem;
              background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30.5%, rgba(0, 0, 0, 0.05) 100%), #454545;
              transition: all 190ms cubic-bezier(0.38, 0.8, 0.2, 1);
              animation: none;

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

              box-shadow:
                0px 0px 3px 0px rgba(253, 224, 71, 0) inset,
                0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
                0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
                0px 0px 0px 1px rgba(0, 0, 0, 0.12),
                0px 1.5px 2px 0px rgba(0, 0, 0, 0.48);
            }

            @keyframes small-btn-glow {
              0%,
              5%,
              95% {
                box-shadow:
                  0px 0px 4px 0px rgba(243, 107, 22, 0) inset,
                  0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
                  0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
                  0px 0px 0px 1px rgba(0, 0, 0, 0.12),
                  0px 1.5px 2px 0px rgba(0, 0, 0, 0.48);
              }

              22% {
                box-shadow:
                  0px 0px 6px 0px #fde047 inset,
                  0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
                  0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
                  0px 0px 0px 1px rgba(0, 0, 0, 0.12),
                  0px 1.5px 2px 0px rgba(0, 0, 0, 0.48);
              }
            }
          `}
        >
          {claimed ? 'Get API keys' : 'Claim keys'}
        </a>
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
