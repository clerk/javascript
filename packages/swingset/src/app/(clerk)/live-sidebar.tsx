'use client';

import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';

import type { SidebarEntry } from '@/components/sidebar-nav-group';
import { SidebarNavGroup } from '@/components/sidebar-nav-group';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { getModule } from '@/lib/registry';

const livePages = [{ groupSlug: 'reverification', componentSlug: 'reverification' }];

function liveGroups() {
  const groups: { group: string; groupSlug: string; components: SidebarEntry[] }[] = [];
  for (const { groupSlug, componentSlug } of livePages) {
    const mod = getModule(groupSlug, componentSlug);
    if (!mod) {
      continue;
    }
    const existing = groups.find(g => g.groupSlug === groupSlug);
    if (existing) {
      existing.components.push({ mod, componentSlug });
    } else {
      groups.push({ group: mod.meta.group, groupSlug, components: [{ mod, componentSlug }] });
    }
  }
  return groups;
}

const groups = liveGroups();

export function LiveSidebar(props: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader className='flex h-12 flex-row items-center border-b px-2'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className='h-auto py-1 text-xs'
              render={<Link href='/' />}
            >
              <ArrowLeftIcon className='size-3.5!' />
              Back to components
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='gap-0'>
        <SidebarGroup className='py-1'>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className='h-auto py-1 text-xs'
                  isActive={pathname === '/live'}
                  render={<Link href='/live' />}
                >
                  Overview
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {groups.map(({ group, groupSlug, components }) => (
          <SidebarNavGroup
            key={group}
            group={group}
            components={components}
            defaultOpen
            hrefFor={componentSlug => `/live/${groupSlug}/${componentSlug}`}
          />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
