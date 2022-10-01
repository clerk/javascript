import { useCallback, useState } from 'react';

type UsePaginationProps = {
  defaultPage: number;
};

export const usePagination = (props: UsePaginationProps = { defaultPage: 1 }): [number, (p: number) => void] => {
  const { defaultPage } = props;
  const [page, setPage] = useState(defaultPage);

  const changePage = useCallback((p: number) => setPage(p), [setPage]);

  return [page, changePage];
};
