import type { OpenSplitClient } from '../client';
import type {
  Group,
  GroupDetail,
  GroupMember,
  CreateGroupRequest,
  AddMemberRequest,
} from '../types';

export class GroupsResource {
  constructor(private client: OpenSplitClient) {}

  list(): Promise<Group[]> {
    return this.client.request('GET', '/groups');
  }

  get(id: string): Promise<GroupDetail> {
    return this.client.request('GET', `/groups/${id}`);
  }

  create(data: CreateGroupRequest): Promise<Group> {
    return this.client.request('POST', '/groups', { body: data });
  }

  delete(id: string): Promise<void> {
    return this.client.request('DELETE', `/groups/${id}`);
  }

  restore(id: string): Promise<Group> {
    return this.client.request('POST', `/groups/${id}/restore`);
  }

  addMember(groupId: string, data: AddMemberRequest): Promise<GroupMember> {
    return this.client.request('POST', `/groups/${groupId}/members`, {
      body: data,
    });
  }

  removeMember(groupId: string, userId: string): Promise<void> {
    return this.client.request(
      'DELETE',
      `/groups/${groupId}/members/${userId}`,
    );
  }
}
