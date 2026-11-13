import { cn } from '@/lib/utils';

const badgeShape = 'label-4 rounded-squircle-md flex h-5 shrink-0 items-center px-1.5 tabular-nums';

const badgeTones = {
  neutral: 'bg-foreground/[0.06] text-gray-600 dark:text-gray-400',
  beta: 'bg-gray-950 text-yellow-500 dark:bg-yellow-500 dark:text-gray-950',
  'beta-on-yellow': 'bg-gray-950 text-yellow-500',
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
