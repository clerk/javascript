import { Icon, type IconProps } from './icon';

export default function Microsoft(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 20 20'>
        <g clipPath='url(#clip0_2269_3296)'>
          <path
            d='M0 0H20V20H0V0Z'
            fill='#F3F3F3'
          />
          <path
            d='M0.870117 0.869141H9.56577V9.56479H0.870117V0.869141Z'
            fill='#F35325'
          />
          <path
            d='M10.4346 0.869141H19.1303V9.56479H10.4346V0.869141Z'
            fill='#81BC06'
          />
          <path
            d='M0.870117 10.4346H9.56577V19.1302H0.870117V10.4346Z'
            fill='#05A6F0'
          />
          <path
            d='M10.4346 10.4346H19.1303V19.1302H10.4346V10.4346Z'
            fill='#FFBA08'
          />
        </g>
        <defs>
          <clipPath id='clip0_2269_3296'>
            <rect
              width='20'
              height='20'
              fill='white'
            />
          </clipPath>
        </defs>
      </svg>
    </Icon>
  );
}
