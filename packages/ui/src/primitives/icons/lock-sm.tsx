import { Icon, type IconProps } from './icon';

export default function LockSm(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 16 16'>
        <path
          d='M5.25 7.75H3.75V11.25C3.75 12.3546 4.64543 13.25 5.75 13.25H10.25C11.3546 13.25 12.25 12.3546 12.25 11.25V7.75H10.75M5.25 7.75V5.5C5.25 3.98122 6.48122 2.75 8 2.75V2.75C9.51878 2.75 10.75 3.98122 10.75 5.5V7.75M5.25 7.75H10.75'
          stroke='currentColor'
          strokeWidth={1.5}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </Icon>
  );
}
