'use client';

import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';

import { SidebarNavigation, type NavigationGroup } from '@/components/sidebar-navigation';
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
import { getLiveSidebarGroups } from '@/lib/live-navigation';

const groups = getLiveSidebarGroups();

function pageIsActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function LiveSidebar(props: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const navigationGroups: NavigationGroup[] = groups.map(({ group, categories }) => ({
    label: group,
    categories: categories.map(({ category, components }) => ({
      label: category,
      items: components.map(({ mod, href }) => ({
        href,
        usage: `<${mod.meta.title} />`,
        isActive: pageIsActive(pathname, href),
        status: mod.meta.status,
        substatus: mod.meta.substatus,
      })),
    })),
  }));

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
        <SidebarNavigation groups={navigationGroups} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
