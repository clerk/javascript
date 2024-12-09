import React, { useState } from 'react';
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
  const initialState = Array(elements.length).fill(null);
  const [nodes, setNodes] = useState<(Element | null)[]>(initialState);

  return elements.map((el, index) => ({
    id: el.id,
    mount: (node: Element) => setNodes(prevState => prevState.map((n, i) => (i === index ? node : n))),
    unmount: () => setNodes(prevState => prevState.map((n, i) => (i === index ? null : n))),
    portal: () => <>{nodes[index] ? createPortal(el.component, nodes[index]) : null}</>,
  }));
};
