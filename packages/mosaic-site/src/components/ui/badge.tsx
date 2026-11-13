import { cn } from '@/lib/utils';

export const badgeClassName =
  'label-4 bg-foreground/[0.06] rounded-squircle-md flex h-5 shrink-0 items-center px-1.5 tabular-nums text-gray-600 dark:text-gray-400';

export function Badge({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      className={cn(badgeClassName, className)}
      {...props}
    />
  );
}
