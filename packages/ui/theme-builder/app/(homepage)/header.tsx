import { Logo } from '../components/logo';

export function Header() {
  return (
    <header className='col-span-full flex shrink-0 items-center justify-between border-b p-4'>
      <h1 className='inline-flex items-center gap-3'>
        <Logo className='h-4 text-neutral-950' />
        <span className='mt-0.5 bg-gradient-to-r from-[#6C47FF] to-[#056D99] bg-clip-text text-sm font-medium text-transparent'>
          Theme Builder
        </span>
      </h1>

      {/* <div className='inline-flex items-center gap-x-2 text-xs'>
            <label htmlFor='component'>Component</label>
            <div className='relative'>
              <select
                name='component'
                id='component'
                value={pathname}
                onChange={e => router.push(e.target.value)}
                className='relative appearance-none rounded border bg-neutral-100 py-1 pl-1.5 pr-5 text-xs after:absolute after:right-1.5 after:top-1 after:size-2 after:bg-red-200'
              >
                <option
                  value='/'
                  disabled
                >
                  Select
                </option>
                <option value='/sign-in'>Sign In</option>
                <option value='/sign-up'>Sign Up</option>
              </select>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
                className='user-select-none pointer-events-none absolute right-1.5 top-1/2 size-2.5 -translate-y-1/2'
                aria-hidden
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='m19.5 8.25-7.5 7.5-7.5-7.5'
                />
              </svg>
            </div>
          </div> */}
    </header>
  );
}
