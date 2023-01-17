export const isomorphicAtob = (data: string) => {
  if (typeof atob !== 'undefined' && typeof atob === 'function') {
    return atob(data);
  } else if (typeof Buffer !== 'undefined') {
    return new Buffer(data, 'base64').toString();
  }
  return data;
};
