import clsx from 'clsx';

export function ActiveDot({ active, className, instant }: { active: boolean; className?: string; instant?: boolean }) {
  return (
    <span
      aria-hidden
      className={clsx(
        'relative inline-block size-2 shrink-0 rounded-full border border-black/20 group-hover:border-black/50 dark:border-white/25 dark:group-hover:border-white/60',
        'after:absolute after:rounded-full',
        instant
          ? 'motion-reduce:after:-inset-px'
          : 'transition-[border] after:transition-[inset] motion-reduce:after:-inset-px motion-reduce:after:transition-colors',
        active ? 'after:-inset-px after:bg-purple-500' : 'after:inset-px after:bg-purple-500/0',
        className,
      )}
    />
  );
}
