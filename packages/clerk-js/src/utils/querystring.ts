export const getQueryParams = (queryString: string) => {
  const queryParamsObject: { [key: string]: string } = {};
  const queryParams = new URLSearchParams(queryString);
  queryParams?.forEach((value, key) => {
    queryParamsObject[key] = value;
  });

  return queryParamsObject as Record<string, string>;
};

export const stringifyQueryParams = (params: Record<string, unknown> | Array<unknown>, encoder?) => {
  const queryParams = new URLSearchParams();
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

  return queryParams.toString();
};
