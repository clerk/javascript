'use client';

import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';

import { StatusDot } from '@/components/StatusDot';
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
import { getLiveSidebarGroups } from '@/lib/live-navigation';

const groups = getLiveSidebarGroups();

function pageIsActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
            <p className='text-muted-foreground px-2 pt-2 text-xs leading-relaxed'>
              These are v1 wire-ups. They may still have bugs, even when they work.
            </p>
          </SidebarGroupContent>
        </SidebarGroup>
        {groups.map(({ group, categories }) => (
          <SidebarGroup
            key={group}
            className='py-1'
          >
            <SidebarGroupLabel className='text-sidebar-foreground/50 h-auto px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider'>
              {group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {categories.map(({ category, components }) => (
                <div key={category || group}>
                  {category ? (
                    <div className='text-sidebar-foreground/40 flex items-center gap-1 px-2 pb-0.5 pt-2 text-[9px] font-semibold uppercase tracking-wider'>
                      <span
                        aria-hidden='true'
                        className='font-mono text-[10px] leading-none'
                      >
                        └
                      </span>
                      {category}
                    </div>
                  ) : null}
                  <SidebarMenu className={category ? 'border-sidebar-border ml-3 w-auto border-l pl-1' : undefined}>
                    {components.map(({ mod, href }) => (
                      <SidebarMenuItem key={href}>
                        <SidebarMenuButton
                          className='h-auto py-1 text-xs'
                          isActive={pageIsActive(pathname, href)}
                          render={<Link href={href} />}
                        >
                          {mod.meta.status ? (
                            <StatusDot
                              status={mod.meta.status}
                              substatus={mod.meta.substatus}
                            />
                          ) : null}
                          <span className='truncate font-mono text-[10px] leading-relaxed'>{`<${mod.meta.title} />`}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
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
