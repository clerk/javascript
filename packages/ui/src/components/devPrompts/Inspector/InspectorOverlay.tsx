// eslint-disable-next-line no-restricted-imports
import { css } from '@emotion/react';
import { flip, offset, shift, useFloating } from '@floating-ui/react';
import copy from 'copy-to-clipboard';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { InspectedData } from './parseClerkElement';

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

interface InspectorOverlayProps {
  inspectedData: InspectedData;
  isFrozen: boolean;
  copiedValue: string | null;
  onCopy: (value: string) => void;
  onClose: () => void;
  tooltipRef: (el: HTMLElement | null) => void;
}

function CopyIcon() {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 16 16'
      fill='none'
      aria-hidden
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M5.333 5.333V3.467c0-.747 0-1.12.145-1.406a1.333 1.333 0 0 1 .583-.582c.285-.146.659-.146 1.406-.146h5.066c.747 0 1.12 0 1.406.146.25.128.454.332.582.582.146.286.146.66.146 1.406v5.067c0 .746 0 1.12-.146 1.405a1.333 1.333 0 0 1-.582.583c-.286.145-.66.145-1.406.145h-1.866M3.467 14.667h5.066c.747 0 1.12 0 1.406-.146.25-.128.454-.332.582-.583.146-.285.146-.659.146-1.405V7.467c0-.747 0-1.12-.146-1.406a1.333 1.333 0 0 0-.582-.583c-.286-.145-.66-.145-1.406-.145H3.467c-.747 0-1.12 0-1.406.145a1.333 1.333 0 0 0-.582.583c-.146.286-.146.66-.146 1.406v5.066c0 .746 0 1.12.146 1.405.128.251.332.455.582.583.286.146.66.146 1.406.146Z'
        stroke='currentColor'
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 16 16'
      fill='none'
      aria-hidden
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M13.333 4 6 11.333 2.667 8'
        stroke='#22c543'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 16 16'
      fill='none'
      aria-hidden
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M12 4 4 12M4 4l8 8'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function CopyRow({ value, copiedValue, onCopy }: { value: string; copiedValue: string | null; onCopy: () => void }) {
  const isCopied = copiedValue === value;
  return (
    <button
      type='button'
      onClick={e => {
        e.stopPropagation();
        copy(value);
        onCopy();
      }}
      css={css`
        ${CSS_RESET};
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        cursor: pointer;
        color: #e8e8e8;
        font-size: 0.75rem;
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}
    >
      <span>{value}</span>
      <span
        css={css`
          flex-shrink: 0;
          margin-left: 0.5rem;
          display: flex;
          align-items: center;
          color: ${isCopied ? '#22c543' : '#8f8f8f'};
        `}
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
      </span>
    </button>
  );
}

export function InspectorOverlay({
  inspectedData,
  isFrozen,
  copiedValue,
  onCopy,
  onClose,
  tooltipRef,
}: InspectorOverlayProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = inspectedData.element;
    setRect(el.getBoundingClientRect());

    if (!isFrozen) {
      let raf: number;
      const update = () => {
        setRect(el.getBoundingClientRect());
        raf = requestAnimationFrame(update);
      };
      raf = requestAnimationFrame(update);
      return () => cancelAnimationFrame(raf);
    }
  }, [inspectedData.element, isFrozen]);

  // Virtual reference element for floating-ui
  const virtualRef = useMemo(() => {
    if (!rect) {
      return null;
    }
    return {
      getBoundingClientRect: () => rect,
    };
  }, [rect]);

  const { floatingStyles, refs } = useFloating({
    placement: 'bottom-start',
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    elements: {
      reference: virtualRef,
    },
  });

  const mergedTooltipRef = useCallback(
    (node: HTMLDivElement | null) => {
      refs.setFloating(node);
      tooltipRef(node);
    },
    [refs.setFloating, tooltipRef],
  );

  if (!rect) {
    return null;
  }

  return (
    <>
      {/* Highlight box */}
      <div
        css={css`
          ${CSS_RESET};
          position: fixed;
          pointer-events: none;
          border: 2px solid rgba(99, 102, 241, 0.8);
          background: rgba(99, 102, 241, 0.1);
          border-radius: 4px;
          z-index: 2147483646;
          transition: ${isFrozen ? 'none' : 'all 0.05s ease-out'};
        `}
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }}
      />

      {/* Tooltip */}
      <div
        ref={mergedTooltipRef}
        style={{
          ...floatingStyles,
          pointerEvents: isFrozen ? 'auto' : 'none',
        }}
        css={css`
          ${CSS_RESET};
          z-index: 2147483647;
          background: #1f1f1f;
          border: 1px solid #3f3f3f;
          border-radius: 0.5rem;
          padding: 0.5rem;
          min-width: 12rem;
          max-width: 24rem;
          box-shadow:
            0px 16px 36px -6px rgba(0, 0, 0, 0.36),
            0px 6px 16px -2px rgba(0, 0, 0, 0.2);
        `}
      >
        {/* Close button — only interactive when frozen */}
        {isFrozen && (
          <button
            type='button'
            aria-label='Close inspector tooltip'
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
            css={css`
              ${CSS_RESET};
              position: absolute;
              top: 0.375rem;
              right: 0.375rem;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 1.25rem;
              height: 1.25rem;
              border-radius: 0.25rem;
              cursor: pointer;
              color: #8f8f8f;
              &:hover {
                color: #e8e8e8;
                background: rgba(255, 255, 255, 0.1);
              }
            `}
          >
            <CloseIcon />
          </button>
        )}

        {/* Classes section */}
        <div
          css={css`
            ${CSS_RESET};
            margin-bottom: ${inspectedData.localizationKey ? '0.5rem' : '0'};
          `}
        >
          <div
            css={css`
              ${CSS_RESET};
              font-size: 0.625rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #8f8f8f;
              padding: 0 0.5rem 0.25rem;
            `}
          >
            Classes
          </div>
          {inspectedData.publicClasses.map(cls => (
            <CopyRow
              key={cls}
              value={cls}
              copiedValue={copiedValue}
              onCopy={() => onCopy(cls)}
            />
          ))}
          {inspectedData.stateClasses.map(cls => (
            <CopyRow
              key={cls}
              value={cls}
              copiedValue={copiedValue}
              onCopy={() => onCopy(cls)}
            />
          ))}
        </div>

        {/* Localization key section */}
        {inspectedData.localizationKey && (
          <div>
            <div
              css={css`
                ${CSS_RESET};
                font-size: 0.625rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #8f8f8f;
                padding: 0 0.5rem 0.25rem;
                border-top: 1px solid #3f3f3f;
                padding-top: 0.5rem;
              `}
            >
              Localization Key
            </div>
            <CopyRow
              value={inspectedData.localizationKey}
              copiedValue={copiedValue}
              onCopy={() => onCopy(inspectedData.localizationKey!)}
            />
          </div>
        )}

        {/* Hint when not frozen */}
        {!isFrozen && (
          <div
            css={css`
              ${CSS_RESET};
              font-size: 0.625rem;
              color: #6b6b6b;
              text-align: center;
              padding-top: 0.375rem;
              border-top: 1px solid #3f3f3f;
              margin-top: 0.375rem;
            `}
          >
            Click to pin
          </div>
        )}
      </div>
    </>
  );
}
