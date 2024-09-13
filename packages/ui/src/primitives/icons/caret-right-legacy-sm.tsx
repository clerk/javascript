import { Icon, type IconProps } from './icon';

export default function CaretRightLegacySm(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 16 16'>
        <path
          d='M10 8.25L6.5 6V10.5L10 8.25Z'
          fill='currentColor'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </Icon>
  );
}
