import { Icon, type IconProps } from './icon';

export default function ExclamationTrianglelg(props: IconProps) {
  return (
    <Icon {...props}>
      <svg viewBox='0 0 48 48'>
        <path
          fill='currentColor'
          fillRule='evenodd'
          d='M18.982 8.798c2.23-3.861 7.806-3.861 10.034 0l14.2 24.613c2.228 3.861-.56 8.688-5.018 8.688H9.8c-4.458 0-7.244-4.827-5.016-8.688L18.98 8.798h.002ZM24 18.928a1.448 1.448 0 0 1 1.448 1.449v7.24a1.448 1.448 0 0 1-2.896 0v-7.24A1.448 1.448 0 0 1 24 18.929Zm0 15.929a1.448 1.448 0 1 0 0-2.896 1.448 1.448 0 0 0 0 2.896Z'
          clipRule='evenodd'
        />
      </svg>
    </Icon>
  );
}
