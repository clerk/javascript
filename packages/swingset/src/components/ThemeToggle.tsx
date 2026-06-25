'use client';

import { useTheme } from 'next-themes';
import * as React from 'react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div className='flex items-center gap-2'>
      <Switch
        id='theme-toggle'
        checked={isDark}
        onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
      />
      <Label
        htmlFor='theme-toggle'
        className='text-muted-foreground cursor-pointer text-xs'
      >
        Dark mode
      </Label>
    </div>
  );
}
