export const AnimatedEye = ({ isHidden }: { isHidden: boolean }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 20 20'
    >
      <path
        fill='currentColor'
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'
      />
      <path
        fill='currentColor'
        fillRule='evenodd'
        clipRule='evenodd'
        d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z'
      />

      <path
        style={
          isHidden
            ? { transform: 'scale3d(1,1,1)', transition: 'transform 50ms ease' }
            : {
                transform: 'scale3d(0,0,0)',
                transition: 'transform 50ms ease',
              }
        }
        fillRule='evenodd'
        clipRule='evenodd'
        fill='currentColor'
        d='M2.293 2.293a1 1 0 0 1 1.414 0l14 14a1 1 0 0 1-1.414 1.414l-6.911-6.911-7.09-7.089a1 1 0 0 1 0-1.414Z'
      />
    </svg>
  );
};
