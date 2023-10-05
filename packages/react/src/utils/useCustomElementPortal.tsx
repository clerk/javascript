import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export type UseCustomElementPortalParams = {
  component: React.ReactNode;
  id: number;
};

export type UseCustomElementPortalReturn = {
  portal: () => JSX.Element;
  mount: (node: Element) => void;
  unmount: () => void;
  id: number;
};

// This function takes a component as prop, and returns functions that mount and unmount
// the given component into a given node
export const useCustomElementPortal = (elements: UseCustomElementPortalParams[]) => {
  const initialState = Array(elements.length).fill(null);
  const [nodes, setNodes] = useState<(Element | null)[]>(initialState);

  const portals: UseCustomElementPortalReturn[] = [];

  elements.forEach((el, index) => {
    const mount = (node: Element) => {
      setNodes(prevState => prevState.map((n, i) => (i === index ? node : n)));
    };
    const unmount = () => {
      setNodes(prevState => prevState.map((n, i) => (i === index ? null : n)));
    };

    const portal = () => <>{nodes[index] ? createPortal(el.component, nodes[index] as Element) : null}</>;
    portals.push({ portal, mount, unmount, id: el.id });
  });

  return portals;
};
