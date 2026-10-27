'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { pagePresets, usePage } from './PageProvider';

export function PageToggle() {
  const { page, setPage } = usePage();

  return (
    <div className='flex items-center gap-2'>
      <Label
        htmlFor='page-toggle'
        className='text-muted-foreground text-xs'
      >
        Page
      </Label>
      <Select
        value={page}
        onValueChange={value => value && setPage(value)}
      >
        <SelectTrigger
          id='page-toggle'
          size='sm'
        >
          <SelectValue>{pagePresets.find(preset => preset.id === page)?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {pagePresets.map(preset => (
            <SelectItem
              key={preset.id}
              value={preset.id}
            >
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
