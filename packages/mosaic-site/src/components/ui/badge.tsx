import { cn } from '@/lib/utils';

const badgeShape = 'label-4 rounded-squircle-md flex h-5 shrink-0 items-center whitespace-nowrap px-1.5 tabular-nums';

const badgeTones = {
  neutral: 'bg-foreground/[0.06] text-gray-600 dark:text-gray-400',
  beta: 'bg-gray-950 text-yellow-500',
  purple: 'bg-purple-500 text-white dark:bg-purple-400 dark:text-gray-950',
};

export type BadgeTone = keyof typeof badgeTones;

export function badgeClassName(tone: BadgeTone = 'neutral') {
  return cn(badgeShape, badgeTones[tone]);
}

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: React.ComponentPropsWithoutRef<'span'> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(badgeClassName(tone), className)}
      {...props}
    />
  );
}
