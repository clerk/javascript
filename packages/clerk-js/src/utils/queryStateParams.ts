import { encodeB64, getClerkQueryParam } from '../utils';

export const buildUrl = ({ base, path }: { base: string; path: string | undefined }) => {
  if (!path) {
    return base;
  }

  return base + path;
};

export const decodeBase64Json = (value: string) => {
  return JSON.parse(atob(value));
};

export const readStateParam = () => {
  const urlClerkState = getClerkQueryParam('__clerk_modal_state') ?? '';

  return urlClerkState ? JSON.parse(atob(urlClerkState)) : null;
};

type SerializeAndAppendModalStateProps = {
  url: string;
  startPath?: string;
  currentPath?: string;
  componentName: string;
};
export const appendModalState = ({
  url,
  startPath = '/user',
  currentPath = '',
  componentName,
}: SerializeAndAppendModalStateProps) => {
  const regexPattern = /CLERK-ROUTER\/VIRTUAL\/.*\//;

  const redirectParams = {
    path: currentPath.replace(regexPattern, '') || '',
    componentName,
    startPath,
  };

  const encodedRedirectParams = encodeB64(JSON.stringify(redirectParams));

  const urlWithParams = new URL(url);
  const searchParams = urlWithParams.searchParams;

  searchParams.set('__clerk_modal_state', encodedRedirectParams);

  urlWithParams.search = searchParams.toString();

  return urlWithParams.toString();
};
