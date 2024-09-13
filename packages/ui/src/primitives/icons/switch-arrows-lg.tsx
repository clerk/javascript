import { Icon, type IconProps } from './icon';

export default function SwitchArrowslg(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 48 48'>
        <path
          fill='currentColor'
          fillRule='evenodd'
          d='M32 4.6a1.876 1.876 0 0 0 .1 2.65l5.25 4.875H15.875a1.875 1.875 0 0 0 0 3.75H37.35L32.1 20.75a1.874 1.874 0 1 0 2.55 2.75l8.75-8.125a1.875 1.875 0 0 0 0-2.75L34.65 4.5a1.876 1.876 0 0 0-2.65.1Zm-16 20a1.875 1.875 0 0 0-2.65-.1L4.6 32.625a1.875 1.875 0 0 0 0 2.75l8.75 8.125a1.876 1.876 0 0 0 2.55-2.75l-5.25-4.875h21.475a1.875 1.875 0 1 0 0-3.75H10.65l5.25-4.875a1.876 1.876 0 0 0 .1-2.65Z'
          clipRule='evenodd'
        />
      </svg>
    </Icon>
  );
}
