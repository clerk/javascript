import { Icon, type IconProps } from './icon';

export default function EnvelopeSm(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 16 16'>
        <path
          d='M2.75 5.75C2.75 4.64543 3.64543 3.75 4.75 3.75H11.25C12.3546 3.75 13.25 4.64543 13.25 5.75V10.25C13.25 11.3546 12.3546 12.25 11.25 12.25H4.75C3.64543 12.25 2.75 11.3546 2.75 10.25V5.75Z'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3 4.75L8 8.25L13 4.75'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </Icon>
  );
}
