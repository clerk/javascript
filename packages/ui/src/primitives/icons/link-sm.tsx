import { Icon, type IconProps } from './icon';

export default function LinkSm(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 16 16'>
        <path
          d='M7.75 3.7891L7.86522 3.67388C9.09706 2.44204 11.0943 2.44204 12.3261 3.67388C13.558 4.90572 13.558 6.90294 12.3261 8.13478L12.2109 8.25M6.75 9.25L9.25 6.75M8.25 12.2109L8.13478 12.3261C6.90294 13.558 4.90572 13.558 3.67388 12.3261C2.44204 11.0943 2.44204 9.09706 3.67388 7.86522L3.78911 7.75'
          stroke='currentColor'
          strokeWidth={1.5}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </Icon>
  );
}
