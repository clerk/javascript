import React, { useState } from 'react';
import { createPortal } from 'react-dom';

// This function takes a component as prop, and returns functions that mount and unmount
// the given component into a given node

export const useCustomElementPortal = (component: JSX.Element) => {
  const [node, setNode] = useState<Element | null>(null);

  const mount = (node: Element) => {
    setNode(node);
  };
  const unmount = () => {
    setNode(null);
  };

  // If mount has been called, CustomElementPortal returns a portal that renders `component`
  // into the passed node

  // Otherwise, CustomElementPortal returns nothing
  const CustomElementPortal = () => <>{node ? createPortal(component, node) : null}</>;

  return { CustomElementPortal, mount, unmount };
};
