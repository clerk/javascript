import Link from 'next/link';

export function BetaNotice() {
  return (
    <Link
      href='/changelog'
      aria-label='This version of Clerk UI is in beta. Not all blocks and configurations are supported. What’s new'
      className='label-3 focus-visible:outline-focus group flex h-8 min-w-0 items-center gap-2.5 rounded-full bg-[#fecf00] py-1 pl-1 pr-1 text-gray-950 sm:pr-3.5'
    >
      <span className='label-4 flex h-6 shrink-0 items-center whitespace-nowrap rounded-full bg-gray-950 px-2 text-[#fecf00]'>
        Beta
      </span>
      <span className='hidden truncate font-normal sm:inline lg:hidden'>This version of Clerk UI is in beta</span>
      <span className='hidden truncate font-normal lg:inline'>
        This version of Clerk UI is in beta. Not all blocks and configurations are supported
      </span>
      <span className='hidden whitespace-nowrap underline decoration-gray-950/40 underline-offset-2 group-hover:decoration-gray-950 sm:inline'>
        What’s new
      </span>
    </Link>
  );
}
