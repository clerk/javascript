import { Icon, type IconProps } from './icon';

export default function ExclamationTriangleSm(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 16 16'>
        <path
          d='M8 6.75V8.25'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M8 10.5V10.51'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M2.95652 10.4518L6.27146 3.8188C6.98366 2.39373 9.01635 2.39373 9.72855 3.81881L13.0435 10.4518C13.686 11.7374 12.7516 13.25 11.3149 13.25H4.68506C3.24842 13.25 2.31404 11.7374 2.95652 10.4518Z'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </Icon>
  );
}
