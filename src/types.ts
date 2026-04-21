/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TaskStatus = 'not_started' | 'submitted' | 'approved' | 'rejected' | 'overdue';

export interface StoreTask {
  id: string;
  taskId: string;
  storeId: string;
  status: TaskStatus;
  submittedAt?: string;
  approvedAt?: string;
  comment?: string;
}

export interface TaskDefinition {
  id: string;
  title: string;
  deadline: string;
  importance: 'high' | 'medium' | 'low';
}

export interface Store {
  id: string;
  name: string;
  area: string;
}
