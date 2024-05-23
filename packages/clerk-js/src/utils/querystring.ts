export const getQueryParams = (queryString: string) => {
  const queryParamsObject: { [key: string]: string } = {};
  const queryParams = new URLSearchParams(queryString);
  queryParams?.forEach((value, key) => {
    queryParamsObject[key] = value;
  });

  return queryParamsObject as Record<string, string>;
};

// export const stringifyQueryParams = (params: Record<string, unknown> | Array<unknown>) => {
//   // const queryParams = new URLSearchParams(toQueryParams);
//   return qs.stringify(params || {});
// };
