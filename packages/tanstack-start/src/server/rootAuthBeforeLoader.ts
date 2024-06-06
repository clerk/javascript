import { authenticateRequest } from './authenticateRequest';
import { loadOptions } from './loadOptions';
import { getResponseClerkState } from './utils/utils';

export const rootAuthBeforeLoader = async (request: Request) => {
  const loadedOptions = loadOptions(request);

  const requestState = await authenticateRequest(request, loadedOptions);

  return getResponseClerkState(requestState);
};
