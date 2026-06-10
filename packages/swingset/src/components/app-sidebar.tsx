'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { toSlug } from '@/lib/slug';

const groups = getSidebarGroups();

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader className='flex h-12 justify-center border-b px-4'>
        <span className='text-sm font-semibold'>Swingset</span>
      </SidebarHeader>
      <SidebarContent className='gap-0'>
        {groups.flatMap(({ stories }) =>
          stories.map(({ mod, componentSlug, names }) => {
            const docsHref = `/components/${componentSlug}`;
            const isOpen = pathname.startsWith(docsHref);

            return (
              <Collapsible
                key={mod.meta.title}
                defaultOpen={isOpen}
                className='group/collapsible'
              >
                <SidebarGroup>
                  <SidebarGroupLabel
                    className='group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm'
                    render={<CollapsibleTrigger />}
                  >
                    {mod.meta.title}
                    <ChevronRightIcon className='group-data-open/collapsible:rotate-90 ml-auto transition-transform' />
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            isActive={pathname === docsHref}
                            render={<Link href={docsHref} />}
                          >
                            Overview
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        {names.map(name => {
                          const href = `/components/${componentSlug}/${toSlug(name)}`;
                          return (
                            <SidebarMenuItem key={name}>
                              <SidebarMenuButton
                                isActive={pathname === href}
                                render={<Link href={href} />}
                              >
                                {name}
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            );
          }),
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
