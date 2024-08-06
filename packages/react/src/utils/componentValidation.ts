import React from 'react';

export const isThatComponent = (v: any, component: React.ReactNode): v is React.ReactNode => {
  return !!v && React.isValidElement(v) && (v as React.ReactElement)?.type === component;
};
