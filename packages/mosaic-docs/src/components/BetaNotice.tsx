// The yellow (#fecf00) matches the Clerk UI beta banner. Narrow screens show only the pill, which still
// links to the changelog.
const CHANGELOG_URL = 'https://github.com/clerk/javascript/blob/main/packages/mosaic/CHANGELOG.md';

export function BetaNotice() {
  return (
    <a
      href={CHANGELOG_URL}
      aria-label='Mosaic is still under construction. Not all APIs are stable. What’s new'
      className='label-3 group flex h-8 min-w-0 items-center gap-2.5 rounded-full bg-[#fecf00] py-1 pl-1 pr-1 text-gray-950 sm:pr-3.5'
    >
      <span className='label-4 flex h-6 shrink-0 items-center whitespace-nowrap rounded-full bg-gray-950 px-2 text-[#fecf00]'>
        Beta
      </span>
      <span className='hidden truncate font-normal sm:inline lg:hidden'>Mosaic is still under construction</span>
      <span className='hidden truncate font-normal lg:inline'>
        Mosaic is still under construction. Not all APIs are stable
      </span>
      <span className='hidden whitespace-nowrap underline decoration-gray-950/40 underline-offset-2 group-hover:decoration-gray-950 sm:inline'>
        What’s new
      </span>
    </a>
  );
}

export function GitHubLink() {
  return (
    <a
      href='https://github.com/clerk/javascript/tree/main/packages/mosaic'
      aria-label='Mosaic on GitHub'
      className='flex size-8 shrink-0 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-950/5 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white'
    >
      <svg
        viewBox='0 0 16 16'
        aria-hidden
        className='size-4.5 fill-current'
      >
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M8 0C3.582 0 0 3.672 0 8.203c0 3.623 2.292 6.699 5.471 7.783.4.075.546-.178.546-.396 0-.194-.007-.71-.01-1.394-2.226.495-2.696-1.1-2.696-1.1-.363-.948-.888-1.2-.888-1.2-.726-.508.055-.499.055-.499.803.058 1.225.845 1.225.845.714 1.253 1.873.891 2.328.682.074-.53.28-.891.509-1.096-1.776-.207-3.644-.911-3.644-4.054 0-.895.312-1.628.823-2.201-.082-.208-.357-1.042.079-2.17 0 0 .672-.222 2.2.84A7.485 7.485 0 0 1 8 3.967c.68.003 1.364.094 2.003.276 1.527-1.062 2.198-.841 2.198-.841.437 1.129.161 1.963.08 2.17.512.574.822 1.307.822 2.202 0 3.15-1.871 3.844-3.653 4.048.288.253.543.753.543 1.519 0 1.095-.01 1.98-.01 2.25 0 .219.144.474.55.394a8.031 8.031 0 0 0 3.96-2.989A8.337 8.337 0 0 0 16 8.203C16 3.672 12.418 0 8 0Z'
        />
      </svg>
    </a>
  );
}
