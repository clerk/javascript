import React from 'react';
import { MemoryRouter } from "react-router-dom";
import { AuthProvider, AuthProviderProps  } from './AuthProvider';

type LayoutProps = AuthProviderProps

export function Layout(props: LayoutProps) {
  return (
    <MemoryRouter>
      <AuthProvider {...props} />
    </MemoryRouter>
  );
}
