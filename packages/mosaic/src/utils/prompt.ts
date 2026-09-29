import type { ReactNode } from 'react';

export type Prompt = {
  content: ReactNode;
  cancel?: () => void;
};
