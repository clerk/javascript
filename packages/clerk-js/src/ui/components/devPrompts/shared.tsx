import { css } from '@emotion/react';

import { Flex } from '@/ui/customizables';

/**
 * A container for prompt components
 * @internal
 */
export function PromptContainer({ children, sx, ...props }: React.ComponentProps<typeof Flex>) {
  return (
    <Flex
      sx={t => [
        {
          borderRadius: '1.25rem',
          fontFamily: t.fonts.$main,
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 100%), #1f1f1f',
          boxShadow:
            '0px 0px 0px 0.5px #2F3037 inset, 0px 1px 0px 0px rgba(255, 255, 255, 0.08) inset, 0px 0px 0.8px 0.8px rgba(255, 255, 255, 0.20) inset, 0px 0px 0px 0px rgba(255, 255, 255, 0.72), 0px 16px 36px -6px rgba(0, 0, 0, 0.36), 0px 6px 16px -2px rgba(0, 0, 0, 0.20);',
          transition: 'all 195ms cubic-bezier(0.2, 0.61, 0.1, 1)',
        },
        sx,
      ]}
      {...props}
    >
      {children}
    </Flex>
  );
}

/**
 * @internal
 */
export const basePromptElementStyles = css`
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
