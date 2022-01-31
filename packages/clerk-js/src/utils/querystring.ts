import qs from 'qs';

export const getQueryParams = (queryString: string) => {
  return qs.parse(queryString || '', {
    ignoreQueryPrefix: true,
  });
};

export const stringifyQueryParams = (params: {}) => {
  return qs.stringify(params || {});
};
