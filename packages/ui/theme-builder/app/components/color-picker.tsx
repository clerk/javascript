import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useId } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';

export function ColorPicker({
  label,
  description,
  color,
  onChange,
}: {
  label: string;
  description?: string;
  color: string;
  onChange: (color: string) => void;
}) {
  const id = useId();
  return (
    <div className='flex flex-col gap-0.5'>
      <div className='mb-1 flex items-center gap-x-1'>
        <label
          className='text-xs font-medium text-neutral-700'
          htmlFor={id}
        >
          {label}
        </label>
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
                className='size-3'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z'
                />
              </svg>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className='max-w-sm rounded bg-neutral-900 p-2 text-xs text-white shadow-lg'
                sideOffset={4}
                collisionPadding={4}
              >
                {description}
                <Tooltip.Arrow className='fill-neutral-900' />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
      <div>
        <Popover.Root>
          <div className='grid grid-cols-[theme(size.8),1fr] overflow-hidden rounded border'>
            <Popover.Trigger className='grid place-content-center border-e'>
              <span
                className='block size-4 rounded-sm border'
                style={{
                  backgroundColor: color,
                }}
              />
            </Popover.Trigger>
            <HexColorInput
              id={id}
              className='h-full grow px-2 py-2 text-sm outline-none'
              color={color}
              onChange={onChange}
            />
          </div>
          <Popover.Content
            sideOffset={4}
            side='bottom'
            align='start'
          >
            <HexColorPicker
              color={color}
              onChange={onChange}
            />
          </Popover.Content>
        </Popover.Root>
      </div>
    </div>
  );
}
