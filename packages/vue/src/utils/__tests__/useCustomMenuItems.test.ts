import { vi } from 'vitest';
import { h } from 'vue';

import { useUserButtonCustomMenuItems } from '../useCustomMenuItems';

describe('useUserButtonCustomMenuItems', () => {
  it('should return empty arrays when no children are provided', () => {
    const { customMenuItems } = useUserButtonCustomMenuItems();
    expect(customMenuItems.value).toEqual([]);
    // expect(customMenuItemsPortals.value).toEqual([]);
  });

  it('should process valid action items', async () => {
    const { customMenuItems, addCustomMenuItem } = useUserButtonCustomMenuItems();

    addCustomMenuItem(
      {
        label: 'Custom Action',
        onClick() {},
        // @ts-expect-error: todo
      },
      h('div', 'Icon'),
    );

    expect(customMenuItems.value).toHaveLength(1);
    expect(customMenuItems.value[0].label).toBe('Custom Action');
    expect(customMenuItems.value[0].onClick).toBeDefined();
    // expect(customMenuItemsPortals.value.size).toBe(1);
  });

  it('should process valid link items', async () => {
    const { customMenuItems, addCustomMenuItem } = useUserButtonCustomMenuItems();

    addCustomMenuItem(
      {
        label: 'Custom Link',
        href: 'https://example.com',
        // @ts-expect-error: todo
      },
      h('div', 'Icon'),
    );

    expect(customMenuItems.value).toHaveLength(1);
    expect(customMenuItems.value[0].label).toBe('Custom Link');
    expect(customMenuItems.value[0].href).toBe('https://example.com');
    // expect(customMenuItemsPortals.value.size).toBe(1);
  });

  it('should process reorder items', async () => {
    const { customMenuItems, addCustomMenuItem } = useUserButtonCustomMenuItems();

    addCustomMenuItem({ label: 'manageAccount' }, undefined);
    addCustomMenuItem({ label: 'signOut' }, undefined);

    expect(customMenuItems.value).toHaveLength(2);
    expect(customMenuItems.value[0].label).toBe('manageAccount');
    expect(customMenuItems.value[1].label).toBe('signOut');
    // expect(customMenuItemsPortals.value.size).toBe(0);
  });

  it('should process valid MenuAction items and call onClick when triggered', () => {
    const mockOnClick = vi.fn();
    const { customMenuItems, addCustomMenuItem } = useUserButtonCustomMenuItems();

    addCustomMenuItem(
      {
        label: 'Custom Action',
        onClick: mockOnClick,
        // @ts-expect-error: todo
      },
      h('div', 'Icon'),
    );

    expect(customMenuItems.value).toHaveLength(1);

    const menuItem = customMenuItems.value[0];
    expect(menuItem).toBeDefined();
    expect(menuItem.label).toBe('Custom Action');
    expect(menuItem.onClick).toBeDefined();

    // expect(result.current.customMenuItemsPortals).toHaveLength(1);

    if (menuItem.onClick) {
      menuItem.onClick();
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    }
  });
});
