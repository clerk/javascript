import { h, Teleport } from 'vue';

import { useCustomElementPortal } from '../useCustomElementPortal';

describe('useCustomElementPortal', () => {
  it('should return empty array when no element is mounted', () => {
    const { portals } = useCustomElementPortal();
    expect(portals.value).toEqual([]);
  });

  it('should add/remove element to portal list', () => {
    const { mount, unmount, portals } = useCustomElementPortal();

    const el = document.createElement('div');
    el.id = 'test-portal';
    const slot = () => [h('div', 'Test Content')];

    mount(el, slot);

    expect(portals.value).toHaveLength(1);

    expect(portals.value[0].type).toBe(Teleport);

    expect(portals.value[0].props!.to).toBe(el);

    unmount(el);

    expect(portals.value).toHaveLength(0);
  });
});
