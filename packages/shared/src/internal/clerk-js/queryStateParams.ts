import { CLERK_MODAL_STATE } from './constants';
import { encodeB64 } from './encoders';
import { getClerkQueryParam } from './queryParams';

export const readStateParam = () => {
  const urlClerkState = getClerkQueryParam(CLERK_MODAL_STATE) ?? '';

  return urlClerkState ? JSON.parse(atob(urlClerkState)) : null;
};

type SerializeAndAppendModalStateProps = {
  url: string;
  startPath?: string;
  currentPath?: string;
  componentName: string;
  socialProvider?: string;
};

export const appendModalState = ({
  url,
  startPath = '/user',
  currentPath = '',
  componentName,
  socialProvider = '',
}: SerializeAndAppendModalStateProps) => {
  const regexPattern = /CLERK-ROUTER\/VIRTUAL\/.*\//;

  const redirectParams = {
    path: currentPath.replace(regexPattern, '') || '',
    componentName,
    startPath,
    socialProvider,
  };

  const encodedRedirectParams = encodeB64(JSON.stringify(redirectParams));

  const urlWithParams = new URL(url);
  const searchParams = urlWithParams.searchParams;

  searchParams.set(CLERK_MODAL_STATE, encodedRedirectParams);

  urlWithParams.search = searchParams.toString();

  return urlWithParams.toString();
};
