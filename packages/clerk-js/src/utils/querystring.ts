export const getQueryParams = (queryString: string): URLSearchParams => {
  const queryParamsObject = new URLSearchParams();
  const queryParams = new URLSearchParams(queryString);
  queryParams.forEach((value, key) => {
    queryParamsObject.set(key, value);
  });

  return queryParamsObject;
};

export const stringifyQueryParams = (params: Record<string, unknown> | Array<unknown>, encoder?) => {
  const queryParams = new URLSearchParams();
  if (params && typeof params === 'object') {
    Object.keys(params).forEach(key => {
      const encodedKey = encoder ? encoder(key) : key;
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(encodedKey, item));
      } else if (value === undefined) {
        return;
      } else {
        queryParams.append(encodedKey, value);
      }
    });
  }

  return queryParams.toString();
};
