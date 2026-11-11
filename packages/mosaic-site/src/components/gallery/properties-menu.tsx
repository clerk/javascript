'use client';
import * as React from 'react';

import { cn } from '@/lib/utils';

export type Property = {
  id: string;
  label: string;
  value: string;
  options: { id: string; label: string; icon?: React.ReactNode }[];
  onChange: (value: string) => void;
};
export function PropertiesIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      className='size-4'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M15 10C16.6575 10 18 8.6575 18 7C18 5.3425 16.6575 4 15 4C13.3425 4 12 5.3425 12 7C12 8.6575 13.3425 10 15 10Z' />
      <path d='M12 7H4M20 7H18' />
      <path d='M9 20C10.6575 20 12 18.6575 12 17C12 15.3425 10.6575 14 9 14C7.3425 14 6 15.3425 6 17C6 18.6575 7.3425 20 9 20Z' />
      <path d='M6 17H4M20 17H12.5' />
    </svg>
  );
}
export function PropertyGroups({ properties }: { properties: Property[] }) {
  return (
    <div className='flex flex-wrap gap-x-10 gap-y-4'>
      {properties.map(property => (
        <div
          key={property.id}
          role='radiogroup'
          aria-label={property.label}
          className='flex flex-col gap-2'
        >
          <span className='font-mono text-[12px] text-neutral-500'>{property.label}</span>
          <div className='flex flex-wrap gap-1.5'>
            {property.options.map(option => (
              <button
                key={option.id}
                type='button'
                role='radio'
                aria-checked={option.id === property.value}
                onClick={() => property.onChange(option.id)}
                className={cn(
                  'flex h-8 items-center gap-2 rounded-lg px-3 text-sm transition-colors',
                  option.id === property.value
                    ? 'bg-foreground/[0.1] text-foreground'
                    : 'hover:bg-foreground/[0.05] text-neutral-600 dark:text-neutral-400',
                )}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
