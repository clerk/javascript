/** Slim strip above the sticky header; it scrolls away with the page. */
export function BackBanner() {
  return (
    <div className='border-b border-gray-950/5 bg-gray-50 text-xs/5 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'>
      <div className='mx-auto flex h-8 max-w-7xl items-center px-4 sm:px-6'>
        <p>
          <a
            href='https://clerk.com'
            className='text-gray-700 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white'
          >
            ← Back to clerk.com
          </a>{' '}
          or{' '}
          <a
            href='https://clerk.com/docs'
            className='text-gray-700 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white'
          >
            clerk.com/docs
          </a>
        </p>
      </div>
    </div>
  );
}
