import { Icon, type IconProps } from './icon';

export default function EyeSm(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 16 16'>
        <path
          d='M13.25 8C13.25 9 12.2 12.25 8 12.25C3.8 12.25 2.75 9 2.75 8C2.75 7 3.8 3.75 8 3.75C12.2 3.75 13.25 7 13.25 8Z'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <circle
          cx='8'
          cy='8'
          r='1.25'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </Icon>
  );
}
