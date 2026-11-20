'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { parseThemeStyle, THEME_STYLES, type ThemeStyle, useThemeStyle } from './useThemeStyle';

const labels: Record<ThemeStyle, string> = {
  default: 'Default',
  clerk: 'Clerk',
};

const items = THEME_STYLES.map(value => ({ label: labels[value], value }));

export function ThemeStyleToggle() {
  const { themeStyle, setThemeStyle } = useThemeStyle();

  return (
    <div className='flex items-center gap-2'>
      <span className='text-muted-foreground text-xs'>Theme</span>
      <Select
        items={items}
        value={themeStyle}
        onValueChange={value => setThemeStyle(parseThemeStyle(value))}
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
