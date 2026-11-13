import { cn } from '@/lib/utils';

const FIRST_PUBLISH = '2026-09-17';

async function fetchDownloads() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const response = await fetch(`https://api.npmjs.org/downloads/point/${FIRST_PUBLISH}:${today}/@clerk/mosaic`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!response.ok) {
      return null;
    }
    const { downloads } = (await response.json()) as { downloads?: number };
    return typeof downloads === 'number' && downloads > 0 ? downloads : null;
  } catch {
    return null;
  }
}

export async function NpmDownloads({ className }: { className?: string }) {
  const downloads = await fetchDownloads();
  if (downloads === null) {
    return null;
  }
  return (
    <span className={cn('label-3 tabular-nums text-gray-500 dark:text-gray-400', className)}>
      <span className='trim-cap'>
        <span className='text-foreground'>{downloads.toLocaleString('en-US')}</span> downloads
      </span>
    </span>
  );
}
