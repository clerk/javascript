// eslint-disable-next-line no-restricted-imports
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

export function PromptSuccessIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      {...props}
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
  );
}

export function handleDashboardUrlParsing(url: string) {
  const __url = new URL(url);
  const regex = /^https?:\/\/(.*?)\/apps\/app_(.+?)\/instances\/ins_(.+?)(?:\/.*)?$/;

  const match = __url.href.match(regex);

  if (!match) {
    throw new Error('Invalid value Dashboard URL structure');
  }

  // Extracting base domain, app ID with prefix, and instanceId with prefix
  return {
    baseDomain: `https://${match[1]}`,
    appId: `app_${match[2]}`,
    instanceId: `ins_${match[3]}`,
  };
}
