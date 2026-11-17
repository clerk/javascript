'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { NavGroup } from '@/lib/navigation';

export function DocsSidebar({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();

  return (
    <nav className='flex flex-col gap-6 text-sm'>
      {groups.map(group => (
        <div key={group.title}>
          <p className='mb-2 px-2 font-medium text-neutral-950'>{group.title}</p>
          <ul className='flex flex-col gap-0.5'>
            {group.items.map(item => {
              const active = item.href === pathname;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className='block rounded-md px-2 py-1.5 text-neutral-600 transition-colors hover:text-neutral-950 aria-[current=page]:bg-neutral-100 aria-[current=page]:text-neutral-950'
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
