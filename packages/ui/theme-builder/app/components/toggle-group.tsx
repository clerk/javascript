import type { ToggleGroupSingleProps } from '@radix-ui/react-toggle-group';
import * as RadixToggleGroup from '@radix-ui/react-toggle-group';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useId } from 'react';

export function ToggleGroup({
  label,
  description,
  items,
  value,
  onValueChange,
}: Pick<ToggleGroupSingleProps, 'value' | 'onValueChange'> & {
  label: string;
  description?: string;
  items: { label: string; value: string }[];
}) {
  const id = useId();
  return (
    <div className='flex flex-col gap-0.5'>
      <div className='mb-1 flex items-center gap-x-1'>
        <span
          className='text-xs font-medium text-neutral-700'
          id={id}
        >
          {label}
        </span>
        {description ? (
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
        ) : null}
      </div>
      <RadixToggleGroup.Root
        aria-labelledby={id}
        type='single'
        value={value}
        onValueChange={v => {
          if (v) {
            onValueChange?.(v);
          }
        }}
        className='grid grid-cols-2 overflow-hidden rounded border'
      >
        {items.map(item => {
          return (
            <RadixToggleGroup.Item
              key={item.value}
              value={item.value}
              className='border-l p-1.5 text-xs font-medium first-of-type:border-0 hover:bg-neutral-50 data-[state="on"]:bg-neutral-100 data-[state="on"]:hover:bg-neutral-50'
            >
              {item.label}
            </RadixToggleGroup.Item>
          );
        })}
      </RadixToggleGroup.Root>
    </div>
  );
}
