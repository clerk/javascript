import type { Ref, SVGProps } from 'react';
import { forwardRef } from 'react';
const SvgGoogle = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1.25em'
    height='1.25em'
    fill='none'
    viewBox='0 0 600 600'
    ref={ref}
    {...props}
  >
    <path
      fill='#4285f4'
      d='M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2'
    />
    <path
      fill='#34a853'
      d='M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9'
    />
    <path
      fill='#fbbc04'
      d='M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4z'
    />
    <path
      fill='#ea4335'
      d='M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4'
    />
  </svg>
);
const ForwardRef = forwardRef(SvgGoogle);
export default ForwardRef;
