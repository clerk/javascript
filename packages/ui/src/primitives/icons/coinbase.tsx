import { Icon, type IconProps } from './icon';

export default function Coinbase(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 20 20'>
        <g clipPath='url(#clip0_2269_3194)'>
          <path
            d='M10 15C7.2375 15 5 12.7625 5 10C5 7.2375 7.2375 5 10 5C12.475 5 14.5292 6.80417 14.925 9.16667H19.9625C19.5375 4.03333 15.2417 0 10 0C4.47917 0 0 4.47917 0 10C0 15.5208 4.47917 20 10 20C15.2417 20 19.5375 15.9667 19.9625 10.8333H14.925C14.5292 13.1958 12.475 15 10 15Z'
            fill='#1652F0'
          />
        </g>
        <defs>
          <clipPath id='clip0_2269_3194'>
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
