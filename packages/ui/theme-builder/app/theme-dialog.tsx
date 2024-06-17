import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

export function ThemeDialog({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (): Promise<void> => {
    try {
      setCopied(true);
      await navigator.clipboard.writeText(children as string);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 grid place-items-center overflow-y-auto bg-black/50 px-4 py-12 backdrop-blur-sm'>
          <Dialog.Content className='relative w-full min-w-0 max-w-4xl rounded-md bg-white p-4'>
            <button
              type='button'
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={handleCopy}
              className='absolute end-6 top-6 p-2'
            >
              <span className='sr-only'>Copy to clipboard</span>
              {copied ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                  className='size-4'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='m4.5 12.75 6 6 9-13.5'
                  />
                </svg>
              ) : (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                  className='size-4'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184'
                  />
                </svg>
              )}
            </button>
            <pre className='w-full overflow-x-auto bg-neutral-100 p-4 text-xs'>
              <code>{children}</code>
            </pre>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
