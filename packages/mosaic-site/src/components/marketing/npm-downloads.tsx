import { cn } from '@/lib/utils';

const FIRST_PUBLISH = '2026-09-17';

const DAY = 24 * 60 * 60 * 1000;
const RANGE_DAYS = 365;

function downloadRanges() {
  const ranges: string[] = [];
  const end = Date.parse(new Date().toISOString().slice(0, 10));
  for (let start = Date.parse(FIRST_PUBLISH); start <= end; start += RANGE_DAYS * DAY) {
    const last = Math.min(start + (RANGE_DAYS - 1) * DAY, end);
    ranges.push(`${new Date(start).toISOString().slice(0, 10)}:${new Date(last).toISOString().slice(0, 10)}`);
  }
  return ranges;
}

async function fetchRange(range: string) {
  const response = await fetch(`https://api.npmjs.org/downloads/point/${range}/@clerk/mosaic`, {
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!response.ok) {
    throw new Error(`npm downloads ${response.status}`);
  }
  const { downloads } = (await response.json()) as { downloads?: number };
  if (typeof downloads !== 'number') {
    throw new Error('npm downloads missing');
  }
  return downloads;
}

async function fetchDownloads() {
  try {
    const counts = await Promise.all(downloadRanges().map(fetchRange));
    const downloads = counts.reduce((sum, count) => sum + count, 0);
    return downloads > 0 ? downloads : null;
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
    <span className={cn('label-3 tabular-nums text-gray-600 dark:text-gray-400', className)}>
      <span className='trim-cap'>
        <span className='text-foreground'>{downloads.toLocaleString('en-US')}</span> downloads
      </span>
    </span>
  );
}
