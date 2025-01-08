import { vi } from 'vitest';
import { h } from 'vue';

import { MenuAction, MenuLink } from '../../components/uiComponents';
import { useUserButtonCustomMenuItems } from '../useCustomMenuItems';

describe('useUserButtonCustomMenuItems', () => {
  const labelIconSlot = () => [h('div', 'Icon')];

  it('should return empty arrays when no children are provided', () => {
    const { customMenuItems, customMenuItemsPortals } = useUserButtonCustomMenuItems();
    expect(customMenuItems.value).toEqual([]);
    expect(customMenuItemsPortals.value).toEqual([]);
  });

  it('should process valid action items', async () => {
    const { customMenuItems, addCustomMenuItem } = useUserButtonCustomMenuItems();

    addCustomMenuItem({
      props: {
        label: 'Custom Action',
        onClick() {},
      },
      slots: {
        labelIcon: labelIconSlot,
      },
      component: MenuAction,
    });

    expect(customMenuItems.value).toHaveLength(1);
    expect(customMenuItems.value[0].label).toBe('Custom Action');
    expect(customMenuItems.value[0].onClick).toBeDefined();
  });

  it('should process valid link items', async () => {
    const { customMenuItems, addCustomMenuItem } = useUserButtonCustomMenuItems();

    addCustomMenuItem({
      props: {
        label: 'Custom Link',
        href: 'https://example.com',
      },
      slots: {
        labelIcon: labelIconSlot,
      },
      component: MenuLink,
    });

    expect(customMenuItems.value).toHaveLength(1);
    expect(customMenuItems.value[0].label).toBe('Custom Link');
    expect(customMenuItems.value[0].href).toBe('https://example.com');
  });

  it('should process reorder items', async () => {
    const { customMenuItems, addCustomMenuItem } = useUserButtonCustomMenuItems();
    addCustomMenuItem({
      props: {
        label: 'manageAccount',
      },
      slots: {},
      component: MenuAction,
    });
    addCustomMenuItem({
      props: {
        label: 'signOut',
      },
      slots: {},
      component: MenuAction,
    });

    expect(customMenuItems.value).toHaveLength(2);
    expect(customMenuItems.value[0].label).toBe('manageAccount');
    expect(customMenuItems.value[1].label).toBe('signOut');
  });

  it('should process valid MenuAction items and call onClick when triggered', () => {
    const mockOnClick = vi.fn();
    const { customMenuItems, addCustomMenuItem } = useUserButtonCustomMenuItems();
    addCustomMenuItem({
      props: {
        label: 'Custom Action',
        onClick: mockOnClick,
      },
      slots: {
        labelIcon: labelIconSlot,
      },
      component: MenuAction,
    });

    expect(customMenuItems.value).toHaveLength(1);

    const menuItem = customMenuItems.value[0];
    expect(menuItem).toBeDefined();
    expect(menuItem.label).toBe('Custom Action');
    expect(menuItem.onClick).toBeDefined();

    if (menuItem.onClick) {
      menuItem.onClick();
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    }
  });
});
