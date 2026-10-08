import { useRef } from 'react';

export const useOrganizationProfileController = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  return { contentRef };
};
