import { joinPaths } from '../../util/path';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { Machine } from '../resources/Machine';
import type { MachineScope } from '../resources/MachineScope';
import type { MachineSecretKey } from '../resources/MachineSecretKey';
import { AbstractAPI } from './AbstractApi';

const basePath = '/machines';

type CreateMachineParams = {
  /**
   * The name of the machine.
   */
  name: string;
  /**
   * Array of machine IDs that this machine will have access to.
   */
  scopedMachines?: string[];
  /**
   * The default time-to-live (TTL) in seconds for tokens created by this machine.
   */
  defaultTokenTtl?: number;
};

type UpdateMachineParams = {
  /**
   * The ID of the machine to update.
   */
  machineId: string;
  /**
   * The name of the machine.
   */
  name?: string;
  /**
   * The default time-to-live (TTL) in seconds for tokens created by this machine.
   */
  defaultTokenTtl?: number;
};

type GetMachineListParams = {
  limit?: number;
  offset?: number;
  query?: string;
};

export class MachineApi extends AbstractAPI {
  async get(machineId: string) {
    this.requireId(machineId);
    return this.request<Machine>({
      method: 'GET',
      path: joinPaths(basePath, machineId),
    });
  }

  async list(queryParams: GetMachineListParams = {}) {
    return this.request<PaginatedResourceResponse<Machine[]>>({
      method: 'GET',
      path: basePath,
      queryParams,
    });
  }

  async create(bodyParams: CreateMachineParams) {
    return this.request<Machine>({
      method: 'POST',
      path: basePath,
      bodyParams,
    });
  }

  async update(params: UpdateMachineParams) {
    const { machineId, ...bodyParams } = params;
    this.requireId(machineId);
    return this.request<Machine>({
      method: 'PATCH',
      path: joinPaths(basePath, machineId),
      bodyParams,
    });
  }

  async delete(machineId: string) {
    this.requireId(machineId);
    return this.request<Machine>({
      method: 'DELETE',
      path: joinPaths(basePath, machineId),
    });
  }

  async getSecretKey(machineId: string) {
    this.requireId(machineId);
    return this.request<MachineSecretKey>({
      method: 'GET',
      path: joinPaths(basePath, machineId, 'secret_key'),
    });
  }

  /**
   * Creates a new machine scope, allowing the specified machine to access another machine.
   *
   * @param machineId - The ID of the machine that will have access to another machine.
   * @param toMachineId - The ID of the machine that will be scoped to the current machine.
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
   * Deletes a machine scope, removing access from one machine to another.
   *
   * @param machineId - The ID of the machine that has access to another machine.
   * @param otherMachineId - The ID of the machine that is being accessed.
   */
  async deleteScope(machineId: string, otherMachineId: string) {
    this.requireId(machineId);
    return this.request<MachineScope>({
      method: 'DELETE',
      path: joinPaths(basePath, machineId, 'scopes', otherMachineId),
    });
  }
}
