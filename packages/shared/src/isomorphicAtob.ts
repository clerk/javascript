/**
 * A function that decodes a string of data which has been encoded using base-64 encoding.
 * Uses `atob` if available, otherwise uses `Buffer` from `globalThis`. If neither are available, returns the data as-is.
 */
export const isomorphicAtob = (data: string) => {
  if (typeof atob !== 'undefined' && typeof atob === 'function') {
    return atob(data);
  } else if (typeof globalThis.Buffer !== 'undefined') {
    return globalThis.Buffer.from(data, 'base64').toString();
  }
  return data;
};
