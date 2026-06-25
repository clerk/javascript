import type React from 'react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type UseCustomElementPortalParams = {
  component: React.ReactNode;
  id: string | number;
};

export type UseCustomElementPortalReturn = {
  portal: React.ComponentType;
  mount: (node: Element) => void;
  unmount: () => void;
  id: string | number;
};

type PortalKey = string | number;

// This function takes a component as prop, and returns functions that mount and unmount
// the given component into a given node
export const useCustomElementPortal = (elements: UseCustomElementPortalParams[]) => {
  const [nodeMap, setNodeMap] = useState<Map<PortalKey, Element | null>>(new Map());
  const nodeMapRef = useRef(nodeMap);
  const elementsRef = useRef<Map<PortalKey, React.ReactNode>>(new Map());
  const portalsRef = useRef<Map<PortalKey, UseCustomElementPortalReturn>>(new Map());

  nodeMapRef.current = nodeMap;
  elementsRef.current = new Map(elements.map(el => [el.id, el.component]));

  const elementIds = new Set(elements.map(el => el.id));
  portalsRef.current.forEach((_, id) => {
    if (!elementIds.has(id)) {
      portalsRef.current.delete(id);
    }
  });

  return elements.map(el => {
    const id = el.id;
    const existingPortal = portalsRef.current.get(id);

    if (existingPortal) {
      return existingPortal;
    }

    const portal: React.ComponentType = () => {
      const node = nodeMapRef.current.get(id);
      const component = elementsRef.current.get(id);
      return node ? createPortal(component, node) : null;
    };

    const customElementPortal = {
      id: el.id,
      mount: (node: Element) => setNodeMap(prev => new Map(prev).set(id, node)),
      unmount: () =>
        setNodeMap(prev => {
          const newMap = new Map(prev);
          newMap.set(id, null);
          return newMap;
        }),
      portal,
    };

    portalsRef.current.set(id, customElementPortal);
    return customElementPortal;
  });
};
