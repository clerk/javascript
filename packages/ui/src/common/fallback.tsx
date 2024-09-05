import * as Icon from '~/primitives/icon';

export function FallBack() {
  return (
    <div className='relative mx-auto flex aspect-square w-full max-w-[25rem] items-center justify-center'>
      <span className='sr-only'>Loading</span>
      <Icon.SpinnerLg
        size='lg'
        className='motion-safe:animate-spin motion-safe:[animation-duration:1.5s]'
      />
    </div>
  );
}
