import type { CustomMenuItem } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { createUserButtonCustomMenuItems as cUBCMI } from '../createCustomMenuItems';

const createUserButtonCustomMenuItems = (arr: any) => cUBCMI(arr, { sdkMetadata: { environment: 'test' } } as any);

describe('createCustomMenuItems', () => {
  describe('createUserButtonCustomMenuItems', () => {
    it('should return the default menu items if no custom items are passed', () => {
      const menuItems = createUserButtonCustomMenuItems([]);
      expect(menuItems.length).toEqual(2);
      expect(menuItems[0].id).toEqual('manageAccount');
      expect(menuItems[1].id).toEqual('signOut');
    });

    it('should return custom menu items after manageAccount items', () => {
      const customMenuItems: CustomMenuItem[] = [
        {
          label: 'Custom1',
          onClick: () => undefined,
          mountIcon: () => undefined,
          unmountIcon: () => undefined,
        },
        {
          label: 'Custom2',
          href: '/custom2',
          mountIcon: () => undefined,
          unmountIcon: () => undefined,
        },
      ];
      const menuItems = createUserButtonCustomMenuItems(customMenuItems);
      expect(menuItems.length).toEqual(4);
      expect(menuItems[0].id).toEqual('manageAccount');
      expect(menuItems[1].name).toEqual('Custom1');
      expect(menuItems[2].name).toEqual('Custom2');
      expect(menuItems[3].id).toEqual('signOut');
    });

    it('should reorder the default menu items when their label is used to target them', () => {
      const customMenuItems: CustomMenuItem[] = [
        {
          label: 'Custom1',
          onClick: () => undefined,
          mountIcon: () => undefined,
          unmountIcon: () => undefined,
        },
        { label: 'signOut' },
        { label: 'manageAccount' },
      ];
      const menuItems = createUserButtonCustomMenuItems(customMenuItems);
      expect(menuItems.length).toEqual(3);
      expect(menuItems[0].name).toEqual('Custom1');
      expect(menuItems[1].id).toEqual('signOut');
      expect(menuItems[2].id).toEqual('manageAccount');
    });

    it('sanitizes the path for external links', () => {
      const customMenuItems: CustomMenuItem[] = [
        {
          label: 'Link1',
          href: 'https://www.fullurl.com',
          mountIcon: () => undefined,
          unmountIcon: () => undefined,
        },
        {
          label: 'Link2',
          href: '/url-with-slash',
          mountIcon: () => undefined,
          unmountIcon: () => undefined,
        },
        {
          label: 'Link3',
          href: 'url-without-slash',
          mountIcon: () => undefined,
          unmountIcon: () => undefined,
        },
      ];
      const menuItems = createUserButtonCustomMenuItems(customMenuItems);
      expect(menuItems.length).toEqual(5);
      expect(menuItems[0].id).toEqual('manageAccount');
      expect(menuItems[1].path).toEqual('https://www.fullurl.com');
      expect(menuItems[2].path).toEqual('/url-with-slash');
      expect(menuItems[3].path).toEqual('/url-without-slash');
      expect(menuItems[4].id).toEqual('signOut');
    });

    it('should handle custom menu items with "open" property', () => {
      const customMenuItems: CustomMenuItem[] = [
        {
          label: 'Custom Open Item',
          open: 'members',
          mountIcon: () => undefined,
          unmountIcon: () => undefined,
        },
      ];
      const menuItems = createUserButtonCustomMenuItems(customMenuItems);
      expect(menuItems.length).toEqual(3);
      expect(menuItems[0].id).toEqual('manageAccount');
      expect(menuItems[1].name).toEqual('Custom Open Item');
      expect(menuItems[1].open).toEqual('members');
      expect(menuItems[2].id).toEqual('signOut');
    });

    it('should handle a mix of custom menu item types', () => {
      const customMenuItems: CustomMenuItem[] = [
        {
          label: 'Custom Click Item',
          onClick: () => undefined,
          mountIcon: () => undefined,
          unmountIcon: () => undefined,
        },
        {
          label: 'Custom Open Item',
          open: 'example',
          mountIcon: () => undefined,
          unmountIcon: () => undefined,
        },
        {
          label: 'Custom Link Item',
          href: '/custom-link',
          mountIcon: () => undefined,
          unmountIcon: () => undefined,
        },
      ];
      const menuItems = createUserButtonCustomMenuItems(customMenuItems);
      expect(menuItems.length).toEqual(5);
      expect(menuItems[0].id).toEqual('manageAccount');
      expect(menuItems[1].name).toEqual('Custom Click Item');
      expect(menuItems[1].onClick).toBeDefined();
      expect(menuItems[2].name).toEqual('Custom Open Item');
      expect(menuItems[2].open).toEqual('example');
      expect(menuItems[3].name).toEqual('Custom Link Item');
      expect(menuItems[3].path).toEqual('/custom-link');
      expect(menuItems[4].id).toEqual('signOut');
    });

    it('should ignore invalid custom menu items', () => {
      const customMenuItems: CustomMenuItem[] = [
        {
          label: 'Valid Click Item',
          onClick: () => undefined,
          mountIcon: () => undefined,
          unmountIcon: () => undefined,
        },
        {
          label: 'Invalid Item',
          // @ts-ignore - Testing invalid item
          invalidProp: true,
        },
        {
          label: 'Valid Open Item',
          open: 'example',
          mountIcon: () => undefined,
          unmountIcon: () => undefined,
        },
      ];
      const menuItems = createUserButtonCustomMenuItems(customMenuItems);
      expect(menuItems.length).toEqual(4);
      expect(menuItems[0].id).toEqual('manageAccount');
      expect(menuItems[1].name).toEqual('Valid Click Item');
      expect(menuItems[2].name).toEqual('Valid Open Item');
      expect(menuItems[3].id).toEqual('signOut');
    });
  });
});
