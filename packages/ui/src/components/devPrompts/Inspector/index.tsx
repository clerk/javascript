// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/react';
import { createPortal } from 'react-dom';

import { InternalThemeProvider } from '../../../styledSystem';
import { InspectorOverlay } from './InspectorOverlay';
import { useInspectorState } from './useInspectorState';

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

function InspectorIcon() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      aria-hidden
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M2 5.333V3.467c0-.747.145-1.12.412-1.406.128-.25.332-.454.582-.582C3.28 1.333 3.653 1.333 4.4 1.333h1.6M2 10.667v1.866c0 .747.145 1.12.412 1.406.128.25.332.454.582.582.286.146.66.146 1.406.146h1.6M10 1.333h1.6c.747 0 1.12 0 1.406.146.25.128.454.332.582.582.146.286.146.66.146 1.406v1.866M10 14.667h1.6c.747 0 1.12 0 1.406-.146.25-.128.454-.332.582-.582.146-.286.146-.66.146-1.406v-1.866'
        stroke='currentColor'
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <circle
        cx='8'
        cy='8'
        r='2'
        stroke='currentColor'
        strokeWidth='1.2'
      />
    </svg>
  );
}

function InspectorInternal() {
  const { isActive, inspectedData, isFrozen, copiedValue, toggle, unfreeze, setCopiedValue } = useInspectorState();

  return (
    <>
      {/* Toggle button */}
      <button
        type='button'
        aria-label={isActive ? 'Deactivate Clerk Inspector' : 'Activate Clerk Inspector'}
        aria-pressed={isActive}
        onClick={toggle}
        css={css`
          ${CSS_RESET};
          position: fixed;
          bottom: 1.25rem;
          left: 1.25rem;
          z-index: 2147483647;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background-color: #1f1f1f;
          color: ${isActive ? '#818cf8' : '#8f8f8f'};
          cursor: pointer;
          box-shadow:
            0px 0px 0px 0.5px ${isActive ? '#818cf8' : '#2f3037'} inset,
            0px 1px 0px 0px rgba(255, 255, 255, 0.08) inset,
            0px 0px 0.8px 0.8px rgba(255, 255, 255, 0.2) inset,
            0px 16px 36px -6px rgba(0, 0, 0, 0.36),
            0px 6px 16px -2px rgba(0, 0, 0, 0.2);
          transition:
            color 150ms ease,
            box-shadow 150ms ease;
          &:hover {
            color: ${isActive ? '#a5b4fc' : '#d9d9d9'};
          }
          &:focus-visible {
            outline: 2px solid #6c47ff;
            outline-offset: 2px;
          }

          @media (prefers-reduced-motion: reduce) {
            transition: none;
          }
        `}
      >
        <InspectorIcon />
      </button>

      {/* Overlay portal */}
      {isActive &&
        inspectedData &&
        createPortal(
          <InspectorOverlay
            inspectedData={inspectedData}
            isFrozen={isFrozen}
            copiedValue={copiedValue}
            onCopy={setCopiedValue}
            onClose={unfreeze}
          />,
          document.body,
        )}
    </>
  );
}

export function Inspector() {
  return (
    <InternalThemeProvider>
      <InspectorInternal />
    </InternalThemeProvider>
  );
}
