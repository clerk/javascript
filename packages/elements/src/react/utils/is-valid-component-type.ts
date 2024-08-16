import * as React from 'react';

export function isValidComponentType(child: React.ReactNode, type: any): child is React.ReactElement {
  return React.isValidElement(child) && child.type === type;
}
