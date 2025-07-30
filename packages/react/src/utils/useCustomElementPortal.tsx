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
  const [nodes, setNodes] = useState<(Element | null)[]>([]);

  return elements.map((el, index) => ({
    id: el.id,
    mount: (node: Element) => {
      setNodes(prevState => {
        const newState = [...prevState];
        // Ensure array is long enough for the index
        while (newState.length <= index) {
          newState.push(null);
        }
        newState[index] = node;
        return newState;
      });
    },
    unmount: () => {
      setNodes(prevState => {
        const newState = [...prevState];
        if (index < newState.length) {
          newState[index] = null;
        }
        return newState;
      });
    },
    portal: () => <>{nodes[index] ? createPortal(el.component, nodes[index]) : null}</>,
  }));
};
