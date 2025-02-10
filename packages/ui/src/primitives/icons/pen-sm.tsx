import { Icon, type IconProps } from './icon';

export default function PenSm(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 16 16'>
        <path
          d='M9.23664 3.44288L4.18161 8.33251C3.90008 8.60483 3.70471 8.95383 3.61974 9.33619L2.75 13.25L6.45529 12.3782C6.81159 12.2943 7.13805 12.1143 7.3991 11.8578L12.6265 6.72023C13.4824 5.78723 13.4537 4.34072 12.5614 3.44288C11.6433 2.51904 10.1547 2.51904 9.23664 3.44288Z'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </Icon>
  );
}
