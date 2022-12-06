import { getClerkQueryParam } from '../utils';

export const decodeBase64Json = (value: string) => {
  return JSON.parse(atob(value));
};

export const encodeBase64Json = (value: { path: string; componentName: string }) => {
  return btoa(JSON.stringify(value));
};

export const readAndRemoveStateParam = () => {
  const urlClerkState = getClerkQueryParam('__clerk_state') ?? '';

  return urlClerkState ? decodeBase64Json(urlClerkState) : null;
};

type SerializeAndAppendModalStateProps = { url: string; currentPath: string; componentName: string };
export const serializeAndAppendModalState = ({
  url,
  currentPath,
  componentName,
}: SerializeAndAppendModalStateProps) => {
  const regexPattern = /CLERK-ROUTER\/VIRTUAL\/.*\//;

  const redirectParams = {
    path: currentPath.replace(regexPattern, '') || '',
    componentName,
  };

  const encodedRedirectParams = encodeBase64Json(redirectParams);

  const urlWithParams = new URL(url);
  const searchParams = urlWithParams.searchParams;

  searchParams.set('__clerk_state', encodedRedirectParams);

  urlWithParams.search = searchParams.toString();

  return urlWithParams.toString();
};
