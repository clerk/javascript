import { joinPaths } from '../../util/path';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { Machine } from '../resources/Machine';
import { AbstractAPI } from './AbstractApi';

const basePath = '/machines';

type CreateMachineParams = {
  name: string;
};

type UpdateMachineParams = {
  machineId: string;
  name: string;
};

type DeleteMachineParams = {
  machineId: string;
};

type GetMachineListParams = {
  limit?: number;
  offset?: number;
  query?: string;
};

export class MachineApi extends AbstractAPI {
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

  async delete(params: DeleteMachineParams) {
    const { machineId } = params;
    this.requireId(machineId);
    return this.request<Machine>({
      method: 'DELETE',
      path: joinPaths(basePath, machineId),
    });
  }

  async get(machineId: string) {
    this.requireId(machineId);
    return this.request<Machine>({
      method: 'GET',
      path: joinPaths(basePath, machineId),
    });
  }
}
