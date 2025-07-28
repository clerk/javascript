import { joinPaths } from '../../util/path';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { Machine } from '../resources/Machine';
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
  name: string;
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
}
