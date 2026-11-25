'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  title: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export function DocsNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();

  return (
    <ul className='m-0 list-none space-y-px p-0'>
      {groups.map((group, index) => (
        <li
          key={group.title}
          className={index === 0 ? 'mt-0' : 'mt-6'}
        >
          <p className='nav-heading'>{group.title}</p>
          <ul className='m-0 list-none space-y-px p-0'>
            {group.items.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={item.href === pathname || pathname.startsWith(`${item.href}/`) ? 'page' : undefined}
                  className='nav-link'
                >
                  <span className='block truncate'>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
