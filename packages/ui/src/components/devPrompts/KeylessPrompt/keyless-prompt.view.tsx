import { inertProps } from '@clerk/shared/inert';
// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/react';
import type { ReactNode } from 'react';

import type { useKeylessPromptController } from './keyless-prompt.controller';

const WIDTH_OPEN = '18rem';
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

function getDuration(isOpen: boolean): string {
  return isOpen ? DURATION_OPEN : DURATION_CLOSE;
}

const ctaButtonStyles = css`
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

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }
  &:focus-visible {
    outline: 2px solid #6c47ff;
    outline-offset: 2px;
  }
`;

export function KeylessPromptView({
  id,
  isDragging,
  cornerStyle,
  containerRef,
  onPointerDown,
  preventClick,
  isInitialized,
  isOpen,
  setIsOpen,
  resolvedContent,
}: ReturnType<typeof useKeylessPromptController>) {
  const ctaElement: ReactNode =
    resolvedContent.cta.kind === 'link' ? (
      <a
        href={resolvedContent.cta.href}
        target='_blank'
        rel='noopener noreferrer'
        css={ctaButtonStyles}
      >
        {resolvedContent.cta.text}
      </a>
    ) : (
      <button
        type='button'
        onClick={resolvedContent.cta.onClick}
        css={ctaButtonStyles}
      >
        {resolvedContent.cta.text}
      </button>
    );

  return (
    <div
      ref={containerRef}
      onPointerDown={isOpen ? undefined : onPointerDown}
      style={{
        ...cornerStyle,
        opacity: isInitialized ? undefined : 0,
      }}
      data-expanded={isOpen}
      css={css`
        ${CSS_RESET};
        position: fixed;
        z-index: 2147483647;
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
        width: ${isOpen ? WIDTH_OPEN : resolvedContent.triggerWidth};
        cursor: ${isDragging ? 'grabbing' : isOpen ? 'default' : 'grab'};
        touch-action: none;
        transition: ${isDragging
          ? 'none'
          : isInitialized
            ? `width ${getDuration(isOpen)} ${EASE_BEZIER}, border-radius ${getDuration(isOpen)} cubic-bezier(0.2, 0, 0, 1)`
            : 'none'};

        @media (prefers-reduced-motion: reduce) {
          transition: none;
        }
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

          @media (prefers-reduced-motion: reduce) {
            transition: none;
          }
        }
        &[data-expanded='true']::before,
        &:hover::before {
          opacity: 0.2;
        }
      `}
    >
      <button
        type='button'
        aria-label='Keyless prompt'
        aria-controls={id}
        aria-expanded={isOpen}
        onClick={() => {
          if (preventClick) {
            return;
          }
          setIsOpen(p => !p);
        }}
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
          {resolvedContent.title}
        </span>
        <svg
          css={css`
            width: 1rem;
            height: 1rem;
            flex-shrink: 0;
            color: #d9d9d9;
            margin-inline-start: auto;
            opacity: ${isOpen ? 0.5 : 0};
            transition: opacity ${getDuration(isOpen)} ease-out;

            @media (prefers-reduced-motion: reduce) {
              transition: none;
            }
            ${isOpen &&
            css`
              button:hover & {
                opacity: 1;
              }
            `}
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
        {...inertProps(!isOpen)}
        css={css`
          ${CSS_RESET};
          display: grid;
          grid-template-rows: ${isOpen ? '1fr' : '0fr'};
          transition: grid-template-rows ${getDuration(isOpen)} ${EASE_BEZIER};

          @media (prefers-reduced-motion: reduce) {
            transition: none;
          }
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

              @media (prefers-reduced-motion: reduce) {
                transition: none;
              }
            `}
          >
            <div
              css={css`
                ${CSS_RESET};
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                & ul {
                  ${CSS_RESET};
                  list-style: disc;
                  padding-left: 1rem;
                }
                & p,
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
                  text-decoration: underline;
                  &:focus-visible {
                    outline: 2px solid #6c47ff;
                    outline-offset: 2px;
                  }
                }
              `}
            >
              {resolvedContent.description}
            </div>

            {ctaElement}
          </div>
        </div>
      </div>
    </div>
  );
}
