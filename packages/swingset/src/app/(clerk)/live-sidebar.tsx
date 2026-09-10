'use client';

import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';

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

const flows = [{ title: 'Reverification', href: '/live/reverification' }];

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
          <SidebarGroupLabel className='text-sidebar-foreground/50 h-auto px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider'>
            Flows
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {flows.map(flow => (
                <SidebarMenuItem key={flow.href}>
                  <SidebarMenuButton
                    className='h-auto py-1 text-xs'
                    isActive={pathname.startsWith(flow.href)}
                    render={<Link href={flow.href} />}
                  >
                    {flow.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
