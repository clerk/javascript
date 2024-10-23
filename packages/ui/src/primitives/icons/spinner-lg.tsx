import { Icon, type IconProps } from './icon';

export default function SpinnerLg(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 48 48'>
        <path
          fill='currentColor'
          d='M33.484 39.884c.425.711.195 1.638-.546 2.008a20 20 0 0 1-20.45-34.247c.678-.477 1.603-.24 2.028.471.425.711.187 1.627-.484 2.113a17 17 0 0 0 17.363 29.078c.746-.36 1.665-.134 2.09.577Z'
        />
      </svg>
    </Icon>
  );
}
