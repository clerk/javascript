'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import { AppSidebar } from './app-sidebar';
import { ThemeToggle } from './ThemeToggle';

function useBreadcrumb() {
  const pathname = usePathname();
  // /components/button        → ["Button"]
  // /components/button/primary → ["Button", "Primary"]
  const parts = pathname
    .replace(/^\/components\//, '')
    .split('/')
    .filter(Boolean);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '));
}

export function ClientRoot({ children }: { children: React.ReactNode }) {
  const crumbs = useBreadcrumb();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='bg-background sticky top-0 flex h-12 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator
            orientation='vertical'
            className='data-vertical:h-4 data-vertical:self-auto mr-2'
          />
          {crumbs.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {crumbs.map((crumb, i) => (
                  <React.Fragment key={crumb}>
                    {i > 0 && <BreadcrumbSeparator className='hidden md:block' />}
                    <BreadcrumbItem className={i < crumbs.length - 1 ? 'hidden md:block' : undefined}>
                      {i < crumbs.length - 1 ? (
                        <BreadcrumbLink href='#'>{crumb}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          <div className='ml-auto'>
            <ThemeToggle />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
