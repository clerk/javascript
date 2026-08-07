import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { Machine } from '../resources/Machine';
import type { MachineScope } from '../resources/MachineScope';
import type { MachineSecretKey } from '../resources/MachineSecretKey';
import { AbstractAPI } from './AbstractApi';
import type { WithSign } from './util-types';

const basePath = '/machines';

/** @generateWithEmptyComment */
export type CreateMachineParams = {
  /** The name of the machine. */
  name: string;
  /** An array of machine IDs that the new machine will have access to. Maximum of 150 scopes per machine. */
  scopedMachines?: string[];
  /** The default time-to-live (TTL) in seconds for tokens created by this machine. Must be at least 1 second. */
  defaultTokenTtl?: number;
};

/** @generateWithEmptyComment */
export type UpdateMachineParams = {
  /** The ID of the machine to update. */
  machineId: string;
  /** The name of the machine. */
  name?: string;
  /** The default time-to-live (TTL) in seconds for tokens created by this machine. Must be at least 1 second. */
  defaultTokenTtl?: number;
};

/** @generateWithEmptyComment */
export type GetMachineListParams = ClerkPaginationRequest<{
  /** Filters machines in a particular order. Prefix a value with `+` to sort in ascending order, or `-` to sort in descending order. Defaults to `-created_at`. */
  orderBy?: WithSign<'name' | 'created_at'>;
  /** Filters machines by ID or name. */
  query?: string;
}>;

/** @generateWithEmptyComment */
export type RotateMachineSecretKeyParams = {
  /** The ID of the machine to rotate the secret key for. */
  machineId: string;
  /** The time in seconds that the previous secret key will remain valid after rotation. This ensures a graceful transition period for updating applications with the new secret key. Set to `0` to immediately expire the previous key. Maximum value is `28800` seconds (8 hours). */
  previousTokenTtl: number;
};

/** @generateWithEmptyComment */
export class MachineApi extends AbstractAPI {
  /**
   * Gets the given machine.
   * @param machineId - The ID of the machine to get.
   * @returns The [`Machine`](https://clerk.com/docs/reference/backend/types/backend-machine) object.
   */
  async get(machineId: string) {
    this.requireId(machineId);
    return this.request<Machine>({
      method: 'GET',
      path: joinPaths(basePath, machineId),
    });
  }

  /**
   * Gets a list of machines for the instance. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`Machine`](https://clerk.com/docs/reference/backend/types/backend-machine) objects and a `totalCount` property containing the total number of machines for the instance.
   */
  async list(queryParams: GetMachineListParams = {}) {
    return this.request<PaginatedResourceResponse<Machine[]>>({
      method: 'GET',
      path: basePath,
      queryParams,
    });
  }

  /**
   * Creates a new machine.
   * @returns The created [`Machine`](https://clerk.com/docs/reference/backend/types/backend-machine) object.
   */
  async create(bodyParams: CreateMachineParams) {
    return this.request<Machine>({
      method: 'POST',
      path: basePath,
      bodyParams,
    });
  }

  /**
   * Updates the given machine.
   * @returns The updated [`Machine`](https://clerk.com/docs/reference/backend/types/backend-machine) object.
   */
  async update(params: UpdateMachineParams) {
    const { machineId, ...bodyParams } = params;
    this.requireId(machineId);
    return this.request<Machine>({
      method: 'PATCH',
      path: joinPaths(basePath, machineId),
      bodyParams,
    });
  }

  /**
   * Deletes the given machine.
   * @param machineId - The ID of the machine to delete.
   * @returns The [`Machine`](https://clerk.com/docs/reference/backend/types/backend-machine) object.
   */
  async delete(machineId: string) {
    this.requireId(machineId);
    return this.request<Machine>({
      method: 'DELETE',
      path: joinPaths(basePath, machineId),
    });
  }

  /**
   * Gets the secret key for the given machine.
   * @param machineId - The ID of the machine to get the secret key for.
   * @returns The machine's secret key.
   */
  async getSecretKey(machineId: string) {
    this.requireId(machineId);
    return this.request<MachineSecretKey>({
      method: 'GET',
      path: joinPaths(basePath, machineId, 'secret_key'),
    });
  }

  /**
   * Rotates the secret key for the given machine.
   * @returns The new secret key.
   */
  async rotateSecretKey(params: RotateMachineSecretKeyParams) {
    const { machineId, previousTokenTtl } = params;
    this.requireId(machineId);
    return this.request<MachineSecretKey>({
      method: 'POST',
      path: joinPaths(basePath, machineId, 'secret_key', 'rotate'),
      bodyParams: {
        previousTokenTtl,
      },
    });
  }

  /**
   * Creates a new machine scope, allowing the specified machine to access another machine. Maximum of 150 scopes per machine.
   *
   * @param machineId - The ID of the machine that will have access to the target machine.
   * @param toMachineId - The ID of the machine that will be accessible by the source machine.
   * @returns The created [`MachineScope`](https://clerk.com/docs/reference/backend/types/backend-machine-scope) object.
   */
  async createScope(machineId: string, toMachineId: string) {
    this.requireId(machineId);
    return this.request<MachineScope>({
      method: 'POST',
      path: joinPaths(basePath, machineId, 'scopes'),
      bodyParams: {
        toMachineId,
      },
    });
  }

  /**
   * Deletes the given machine scope, removing access from one machine to another.
   *
   * @param machineId - The ID of the machine that has access to the target machine.
   * @param otherMachineId - The ID of the machine that will no longer be accessible by the source machine.
   * @returns The deleted [`MachineScope`](https://clerk.com/docs/reference/backend/types/backend-machine-scope) object.
   */
  async deleteScope(machineId: string, otherMachineId: string) {
    this.requireId(machineId);
    return this.request<MachineScope>({
      method: 'DELETE',
      path: joinPaths(basePath, machineId, 'scopes', otherMachineId),
    });
  }
}
