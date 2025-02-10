import { Icon, type IconProps } from './icon';

export default function CheckmarkCircleSm(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 16 16'>
        <circle
          cx='8'
          cy='8'
          r='5.25'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M6.25 8.35L7.65 9.75L9.75 6.25'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </Icon>
  );
}
