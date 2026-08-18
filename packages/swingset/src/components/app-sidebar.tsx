'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { getSidebarGroups } from '@/lib/registry';
import type { StoryModule } from '@/lib/types';

const groups = getSidebarGroups();

type SidebarEntry = { mod: StoryModule; componentSlug: string };

function getNavigationFamilies(components: SidebarEntry[]) {
  const families = new Map<string, Map<string, SidebarEntry[]>>();

  for (const component of components) {
    const family = component.mod.meta.navigation?.family ?? '';
    const category = component.mod.meta.navigation?.category ?? '';
    const categories = families.get(family) ?? new Map<string, SidebarEntry[]>();
    const entries = categories.get(category) ?? [];

    entries.push(component);
    categories.set(category, entries);
    families.set(family, categories);
  }

  return Array.from(families, ([family, categories]) => ({
    family,
    categories: Array.from(categories, ([category, components]) => ({
      category,
      components: components.sort(
        (a, b) =>
          (a.mod.meta.navigation?.order ?? Number.MAX_SAFE_INTEGER) -
          (b.mod.meta.navigation?.order ?? Number.MAX_SAFE_INTEGER),
      ),
    })),
  }));
}

function SidebarEntryLink({
  entry,
  groupSlug,
  pathname,
}: {
  entry: SidebarEntry;
  groupSlug: string;
  pathname: string;
}) {
  const { mod, componentSlug } = entry;
  const href = `/${groupSlug}/${componentSlug}`;
  const usage = mod.meta.label
    ? mod.meta.label
    : mod.meta.group === 'Hooks'
      ? `${mod.meta.title}()`
      : mod.meta.group === 'Styles'
        ? mod.meta.title
        : `<${mod.meta.title} />`;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className='h-auto items-start py-1 text-xs leading-relaxed'
        isActive={pathname === href}
        render={<Link href={href} />}
      >
        <span
          className={
            mod.meta.label
              ? 'whitespace-normal text-[11px] leading-relaxed'
              : 'whitespace-normal! break-all font-mono text-[10px] leading-relaxed'
          }
        >
          {usage}
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader className='flex h-12 flex-row items-center gap-2 border-b px-4'>
        <svg
          width='160'
          height='160'
          viewBox='0 0 160 160'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          aria-hidden='true'
          className='size-5 shrink-0'
        >
          <rect
            width='160'
            height='160'
            rx='80'
            fill='var(--brand)'
          />
          <path
            d='M111.125 33.4395C112.875 34.6113 113.024 37.0763 111.535 38.5652L98.7464 51.3541C97.5905 52.5099 95.7974 52.6925 94.3426 51.9472C90.0408 49.7434 85.1656 48.5 80 48.5C62.603 48.5 48.5 62.603 48.5 80C48.5 85.1656 49.7434 90.0408 51.9472 94.3426C52.6925 95.7974 52.5099 97.5905 51.3541 98.7464L38.5652 111.535C37.0763 113.024 34.6113 112.875 33.4395 111.125C27.4773 102.224 24 91.5181 24 80C24 49.0721 49.0721 24 80 24C91.5181 24 102.224 27.4773 111.125 33.4395Z'
            fill='white'
            fillOpacity='0.4'
          />
          <path
            d='M97.5 80C97.5 89.665 89.665 97.5 80 97.5C70.335 97.5 62.5 89.665 62.5 80C62.5 70.335 70.335 62.5 80 62.5C89.665 62.5 97.5 70.335 97.5 80Z'
            fill='white'
          />
          <path
            d='M111.535 121.435C113.024 122.924 112.875 125.389 111.125 126.56C102.224 132.523 91.5181 136 80 136C68.4819 136 57.7759 132.523 48.8747 126.56C47.1253 125.389 46.9758 122.924 48.4647 121.435L61.2535 108.646C62.4094 107.49 64.2025 107.307 65.6573 108.053C69.9592 110.257 74.8344 111.5 80 111.5C85.1656 111.5 90.0408 110.257 94.3427 108.053C95.7975 107.307 97.5906 107.49 98.7465 108.646L111.535 121.435Z'
            fill='white'
          />
        </svg>
        <span className='text-sidebar-foreground/70 text-[10px] font-medium'>Mosaic - Swingset</span>
      </SidebarHeader>
      <SidebarContent className='gap-0'>
        {groups.map(({ group, groupSlug, components }) => (
          <SidebarGroup
            key={group}
            className='py-1'
            data-section={group}
          >
            <SidebarGroupLabel className='text-sidebar-foreground/50 h-auto px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider'>
              {group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {getNavigationFamilies(components).map(({ family, categories }) => (
                <div key={family || group}>
                  {family ? (
                    <div className='text-sidebar-foreground/80 px-2 pb-1 pt-3 text-[11px] font-semibold'>{family}</div>
                  ) : null}
                  {categories.map(({ category, components }) => (
                    <div key={category || group}>
                      {category ? (
                        <div className='text-sidebar-foreground/45 px-3 pb-1 pt-2 text-[9px] font-semibold uppercase tracking-wider'>
                          {category}
                        </div>
                      ) : null}
                      <SidebarMenu className={category ? 'px-1' : undefined}>
                        {components.map(entry => (
                          <SidebarEntryLink
                            key={entry.mod.meta.title}
                            entry={entry}
                            groupSlug={groupSlug}
                            pathname={pathname}
                          />
                        ))}
                      </SidebarMenu>
                    </div>
                  ))}
                </div>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
