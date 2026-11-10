'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { type ThemeStyle, useThemeStyle } from './ThemeStyleProvider';

const items: { label: string; value: ThemeStyle }[] = [
  { label: 'Clerk', value: 'clerk' },
  { label: 'Default', value: 'default' },
];

export function ThemeStyleToggle() {
  const { themeStyle, setThemeStyle } = useThemeStyle();

  return (
    <div className='flex items-center gap-2'>
      <span className='text-muted-foreground text-xs'>Theme</span>
      <Select
        items={items}
        value={themeStyle}
        onValueChange={value => setThemeStyle(value === 'default' ? 'default' : 'clerk')}
      >
        <SelectTrigger
          size='sm'
          className='w-24 text-xs'
          aria-label='Theme'
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map(item => (
              <SelectItem
                key={item.value}
                value={item.value}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
