import type { Showcase } from '../types';
import { buttonVariants } from './button-variants';
import { userButtonDisplay } from './user-button-display';
import { userButtonMatrix } from './user-button-matrix';
import { userProfileCombined } from './user-profile-combined';

export const showcases = [userButtonDisplay, userProfileCombined, buttonVariants, userButtonMatrix] as Showcase<any>[];

export function getShowcase(slug: string) {
  return showcases.find(showcase => showcase.slug === slug);
}
