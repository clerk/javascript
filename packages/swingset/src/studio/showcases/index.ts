import type { Showcase } from '../types';
import { buttonVariants } from './button-variants';
import { userButtonDisplay } from './user-button-display';

export const showcases = [userButtonDisplay, buttonVariants] as Showcase<any>[];

export function getShowcase(slug: string) {
  return showcases.find(showcase => showcase.slug === slug);
}
