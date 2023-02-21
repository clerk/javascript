import { CLERK_REDIRECT_STATE } from '../core/constants';
import { encodeB64, getClerkQueryParam } from '../utils';

export const buildVirtualRouterUrl = ({ base, path }: { base: string; path: string | undefined }) => {
  if (!path) {
    return base;
  }

  return base + path;
};

type RedirectStateParam = {
  startPath: string;
  path: string;
  componentName: string;
  socialProvider: string;
  modal: boolean;
};

export const readStateParam = () => {
  const urlClerkState = getClerkQueryParam(CLERK_REDIRECT_STATE) ?? '';

  return (urlClerkState ? JSON.parse(atob(urlClerkState)) : null) as RedirectStateParam | null;
};

type SerializeAndAppendRedirectStateProps = {
  url: string;
  startPath?: string;
  currentPath?: string;
  componentName?: string;
  socialProvider?: string;
  modal?: boolean;
};

export const appendRedirectState = ({
  url,
  startPath = '/user',
  currentPath = '',
  componentName = '',
  socialProvider = '',
  modal = false,
}: SerializeAndAppendRedirectStateProps) => {
  const regexPattern = /CLERK-ROUTER\/(.*?)\/.*\//;

  const redirectParams = {
    path: currentPath.replace(regexPattern, '') || '',
    componentName,
    startPath,
    socialProvider,
    modal,
  };

  const encodedRedirectParams = encodeB64(JSON.stringify(redirectParams));

  const urlWithParams = new URL(url);
  const searchParams = urlWithParams.searchParams;

  searchParams.set(CLERK_REDIRECT_STATE, encodedRedirectParams);

  urlWithParams.search = searchParams.toString();

  return urlWithParams.toString();
};
