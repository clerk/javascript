export interface NavItem {
  title: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    title: 'Get started',
    items: [{ title: 'Introduction', href: '/docs' }],
  },
];
