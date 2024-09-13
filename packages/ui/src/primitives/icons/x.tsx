import { Icon, type IconProps } from './icon';

export default function X(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 20 20'>
        <g clipPath='url(#clip0_2_5)'>
          <path
            d='M15.75 0.9375H18.8175L12.1175 8.615L20 19.0625H13.8287L8.995 12.725L3.46375 19.0625H0.395L7.56125 10.85L0 0.9375H6.32875L10.6975 6.72875L15.75 0.9375ZM14.675 17.2225H16.375L5.40375 2.68125H3.58125L14.675 17.2225Z'
            className='fill-[var(--cl-light,black)_var(--cl-dark,white)]'
          />
        </g>
        <defs>
          <clipPath id='clip0_2_5'>
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
