// For a comprehensive Metamask error list, please see
// https://docs.metamask.io/guide/ethereum-provider.html#errors
export interface MetamaskError extends Error {
  code: 4001 | 32602 | 32603;
  message: string;
  data?: unknown;
}
