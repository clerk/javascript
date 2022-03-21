export type BuildEmailAddressParams = {
  localPart: string;
  frontendApi: string;
};

export function buildEmailAddress({ localPart, frontendApi }: BuildEmailAddressParams): string {
  const domain = frontendApi ? frontendApi.replace('clerk.', '') : 'clerk.dev';
  return `${localPart}@${domain}`;
}
