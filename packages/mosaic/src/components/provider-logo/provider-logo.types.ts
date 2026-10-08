import type React from 'react';

export type ProviderLogoGlyph = {
  id: string;
  viewBox: string;
  render: (uid: string) => React.ReactElement;
};
