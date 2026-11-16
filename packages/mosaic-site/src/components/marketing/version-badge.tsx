import { badgeClassName } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const version = process.env.NEXT_PUBLIC_MOSAIC_VERSION;

export function VersionBadge({ className }: { className?: string }) {
  return (
    <a
      href='https://www.npmjs.com/package/@clerk/mosaic'
      target='_blank'
      rel='noreferrer'
      aria-label={`Version ${version} on npm (opens in a new tab)`}
      className={cn(
        badgeClassName(),
        'hover:bg-foreground/10 focus-visible:outline-focus transition-colors hover:text-gray-800 dark:hover:text-gray-200',
        className,
      )}
    >
      v{version}
    </a>
  );
}
