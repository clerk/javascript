import type React from 'react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export type UseCustomElementPortalParams = {
  component: React.ReactNode;
  id: number;
};

export type UseCustomElementPortalReturn = {
  portal: () => React.JSX.Element;
  mount: (node: Element) => void;
  unmount: () => void;
  id: number;
};

// This function takes a component as prop, and returns functions that mount and unmount
// the given component into a given node
export const useCustomElementPortal = (elements: UseCustomElementPortalParams[]) => {
  const [nodeMap, setNodeMap] = useState<Map<string, Element | null>>(new Map());

  return elements.map(el => ({
    id: el.id,
    mount: (node: Element) => setNodeMap(prev => new Map(prev).set(String(el.id), node)),
    unmount: () =>
      setNodeMap(prev => {
        const newMap = new Map(prev);
        newMap.set(String(el.id), null);
        return newMap;
      }),
    portal: () => {
      const node = nodeMap.get(String(el.id));
      return node ? createPortal(el.component, node) : null;
    },
  }));
};
