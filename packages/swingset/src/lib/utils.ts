import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { StoryModule } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fillsFrame(storyModule: StoryModule): boolean {
  const category = storyModule.meta.navigation?.category;
  return category === 'Sections' || category === 'Panels';
}
