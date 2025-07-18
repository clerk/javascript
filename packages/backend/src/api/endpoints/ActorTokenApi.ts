import { joinPaths } from '../../util/path';
import type { ActorToken } from '../resources/ActorToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/actor_tokens';

type ActorTokenActorCreateParams = {
  /**
   * The ID of the actor.
   */
  sub: string;
  /**
   * Additional properties of the actor.
   */
  additionalProperties?: { [k: string]: any };
};

type ActorTokenCreateParams = {
  /**
   * The ID of the user being impersonated.
   */
  userId: string;
  /**
   * The actor payload. It needs to include a sub property which should contain the ID of the actor.
   *
   * @remarks
   * This whole payload will be also included in the JWT session token.
   */
  actor: ActorTokenActorCreateParams;
  /**
   * Optional parameter to specify the life duration of the actor token in seconds.
   *
   * @remarks
   * By default, the duration is 1 hour.
   */
  expiresInSeconds?: number | undefined;
  /**
   * The maximum duration that the session which will be created by the generated actor token should last.
   *
   * @remarks
   * By default, the duration of a session created via an actor token, lasts 30 minutes.
   */
  sessionMaxDurationInSeconds?: number | undefined;
};

export class ActorTokenAPI extends AbstractAPI {
  public async create(params: ActorTokenCreateParams) {
    return this.request<ActorToken>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async revoke(actorTokenId: string) {
    this.requireId(actorTokenId);
    return this.request<ActorToken>({
      method: 'POST',
      path: joinPaths(basePath, actorTokenId, 'revoke'),
    });
  }
}
