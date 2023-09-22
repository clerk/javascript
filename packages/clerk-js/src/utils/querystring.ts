import qs from 'qs';

export const getQueryParams = (queryString: string) => {
  return qs.parse(queryString || '', {
    ignoreQueryPrefix: true,
  });
};

export const stringifyQueryParams = (params: Record<string, unknown> | Array<unknown>) => {
  return qs.stringify(params || {});
};
