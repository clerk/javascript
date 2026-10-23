import type { getSidebarGroups } from '@/lib/registry';

export type SidebarEntry = ReturnType<typeof getSidebarGroups>[number]['components'][number];

export type SidebarCategory = { category: string; components: SidebarEntry[] };

// Partitions a group's entries by `meta.navigation.category` into subheaded runs. Category and
// entry order both follow first appearance in the registry; uncategorized entries get no subheading.
export function getSidebarCategories(components: SidebarEntry[]): SidebarCategory[] {
  const categories: SidebarCategory[] = [];
  for (const component of components) {
    const category = component.mod.meta.navigation?.category ?? '';
    const bucket = categories.find(c => c.category === category);
    if (bucket) {
      bucket.components.push(component);
    } else {
      categories.push({ category, components: [component] });
    }
  }
  return categories;
}
