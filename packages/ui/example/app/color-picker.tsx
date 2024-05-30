import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import { type HslColor, HslColorPicker } from 'react-colorful';
export type { HslColor } from 'react-colorful';

export function ColorPicker({
  label,
  description,
  color,
  onChange,
}: {
  label: string;
  description?: string;
  color: HslColor;
  onChange: (color: HslColor) => void;
}) {
  const backgroundColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
  return (
    <div>
      <div className='mb-1 flex items-center gap-x-1'>
        <label className='text-xs font-medium text-neutral-700'>{label}</label>
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
          <Popover.Trigger className='flex w-full items-center gap-x-2 rounded border px-2 py-1 text-sm'>
            <span
              className='block size-4 rounded-sm border'
              style={{
                backgroundColor,
              }}
            />{' '}
            {backgroundColor}
          </Popover.Trigger>
          <Popover.Content
            sideOffset={4}
            side='bottom'
            align='start'
          >
            <HslColorPicker
              color={color}
              onChange={onChange}
            />
          </Popover.Content>
        </Popover.Root>
      </div>
    </div>
  );
}
