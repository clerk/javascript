export const getQueryParams = (queryString: string) => {
  const queryParamsObject: { [key: string]: string | string[] } = {};
  const queryParams = new URLSearchParams(queryString);
  queryParams.forEach((value, key) => {
    if (key in queryParamsObject) {
      // If the key already exists, we need to handle it as an array
      const existingValue = queryParamsObject[key];
      if (Array.isArray(existingValue)) {
        existingValue.push(value);
      } else {
        queryParamsObject[key] = [existingValue, value];
      }
    } else {
      queryParamsObject[key] = value;
    }
  });
  return queryParamsObject as Record<string, string>;
};

type StringifyQueryParamsOptions = {
  keyEncoder?: (key: string) => string;
};

export const stringifyQueryParams = (
  params:
    | Record<string, string | undefined | null | object | Array<string | undefined | null>>
    | null
    | undefined
    | string,
  opts: StringifyQueryParamsOptions = {},
) => {
  if (params === null || params === undefined) {
    return '';
  }

  const queryParams = new URLSearchParams();
  if (params && typeof params === 'object') {
    Object.keys(params).forEach(key => {
      const encodedKey = opts.keyEncoder ? opts.keyEncoder(key) : key;
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach(v => v !== undefined && queryParams.append(encodedKey, v || ''));
      } else if (value === undefined) {
        return;
      } else if (typeof value === 'object' && value !== null) {
        queryParams.append(encodedKey, JSON.stringify(value));
      } else {
        queryParams.append(encodedKey, value || '');
      }
    });
  }

  return queryParams.toString();
};
