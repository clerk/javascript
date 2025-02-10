import { Icon, type IconProps } from './icon';

export default function Twitch(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 20 20'>
        <path
          d='M17.3808 9.28585L14.5236 12.143H11.6665L9.16644 14.643V12.143H5.95215V1.42871H17.3808V9.28585Z'
          fill='white'
        />
        <path
          d='M5.23842 0L1.66699 3.57143V16.4286H5.9527V20L9.52413 16.4286H12.3812L18.8098 10V0H5.23842ZM17.3812 9.28571L14.5241 12.1429H11.6669L9.16699 14.6429V12.1429H5.9527V1.42857H17.3812V9.28571Z'
          fill='#9146FF'
        />
        <path
          d='M15.239 3.92871H13.8105V8.21442H15.239V3.92871Z'
          fill='#9146FF'
        />
        <path
          d='M11.3104 3.92871H9.88184V8.21442H11.3104V3.92871Z'
          fill='#9146FF'
        />
      </svg>
    </Icon>
  );
}
