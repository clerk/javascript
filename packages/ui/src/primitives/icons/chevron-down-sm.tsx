import { Icon, type IconProps } from './icon';

export default function ChevronUpDownSm(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 16 16'>
        <path
          d='M5.75 5.25L8 2.75L10.25 5.25'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M5.75 10.75L8 13.25L10.25 10.75'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </Icon>
  );
}
