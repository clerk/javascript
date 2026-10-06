/**
 * A loose shape check, enough to catch an obviously malformed address. Not a
 * full validator: the server has the final say.
 */
export const isEmail = (str: string): boolean => /^\S+@\S+\.\S+$/.test(str);
