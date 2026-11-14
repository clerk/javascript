import clsx from 'clsx';

export function Container({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={clsx(
        className,
        'mx-auto w-full px-6 md:max-w-[44rem] md:px-0 lg:max-w-[59rem] xl:max-w-[70rem] 2xl:max-w-[76rem]',
      )}
      {...props}
    />
  );
}
