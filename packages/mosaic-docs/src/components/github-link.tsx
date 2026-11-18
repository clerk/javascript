import { site } from '@/lib/site';

export function GitHubLink({ iconClassName }: { iconClassName: string }) {
  return (
    <a
      href={site.githubUrl}
      aria-label='GitHub'
      className='text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors'
    >
      <svg
        aria-hidden='true'
        viewBox='0 0 24 24'
        fill='currentColor'
        className={iconClassName}
      >
        <path d='M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.2 11.16.6.1.82-.25.82-.56v-2c-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.33-1.73-1.33-1.73-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.8 1.28 3.49.98.1-.76.42-1.28.76-1.58-2.67-.3-5.47-1.3-5.47-5.79 0-1.28.47-2.32 1.24-3.14-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.2a11.6 11.6 0 0 1 6.01 0c2.29-1.52 3.3-1.2 3.3-1.2.66 1.65.25 2.87.12 3.17.77.82 1.23 1.86 1.23 3.14 0 4.5-2.8 5.48-5.48 5.77.43.36.81 1.08.81 2.18v3.23c0 .31.21.67.82.56A12.3 12.3 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z' />
      </svg>
    </a>
  );
}
