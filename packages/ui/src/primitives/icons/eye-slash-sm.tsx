import { Icon, type IconProps } from './icon';

export default function EyeSlashSm(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 16 16'>
        <path
          d='M2.949 7C2.80739 7.40946 2.75 7.76622 2.75 8C2.75 9 3.8 12.25 8 12.25C8.35547 12.25 8.68838 12.2267 9 12.1835M11.5 11.1743C12.8384 10.134 13.25 8.62607 13.25 8C13.25 7 12.2 3.75 8 3.75C6.7199 3.75 5.73242 4.05191 4.97809 4.5'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M8.88388 8.88388C9.37204 8.39573 9.37204 7.60427 8.88388 7.11612C8.39573 6.62796 7.60427 6.62796 7.11612 7.11612'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3 3L13 13'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </Icon>
  );
}
