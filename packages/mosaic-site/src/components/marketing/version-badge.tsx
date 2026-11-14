import { cn } from '@/lib/utils';

const version = process.env.NEXT_PUBLIC_MOSAIC_VERSION;

export function VersionBadge({ className }: { className?: string }) {
  return (
    <a
      href='https://www.npmjs.com/package/@clerk/mosaic'
      target='_blank'
      rel='noreferrer'
      aria-label={`Version ${version} on npm`}
      className={cn(
        'label-4 bg-foreground/[0.06] hover:bg-foreground/10 focus-visible:outline-focus rounded-squircle-md flex h-5 shrink-0 items-center px-1.5 tabular-nums text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
        className,
      )}
    >
      v{version}
    </a>
  );
}
