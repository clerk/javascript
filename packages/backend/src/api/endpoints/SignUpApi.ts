import { joinPaths } from '../../util/path';
import type { SignUpAttempt } from '../resources/SignUpAttempt';
import { AbstractAPI } from './AbstractApi';

type UpdateSignUpParams = {
  signUpAttemptId: string;
  externalId?: string | null;
  customAction?: boolean | null;
};

const basePath = '/sign_ups';

export class SignUpAPI extends AbstractAPI {
  public async get(signUpAttemptId: string) {
    this.requireId(signUpAttemptId);

    return this.request<SignUpAttempt>({
      method: 'GET',
      path: joinPaths(basePath, signUpAttemptId),
    });
  }

  public async update(params: UpdateSignUpParams) {
    const { signUpAttemptId, ...bodyParams } = params;

    return this.request<SignUpAttempt>({
      method: 'PATCH',
      path: joinPaths(basePath, signUpAttemptId),
      bodyParams,
    });
  }
}
