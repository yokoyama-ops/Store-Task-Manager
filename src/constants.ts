/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Store, TaskDefinition, StoreTask } from './types';

export const STORES: Store[] = [
  { id: 's1', name: '新宿店', area: '東京中央', stamps: 12 },
  { id: 's2', name: '渋谷店', area: '東京中央', stamps: 8 },
  { id: 's3', name: '池袋店', area: '東京北', stamps: 15 },
  { id: 's4', name: '横浜店', area: '神奈川', stamps: 5 },
  { id: 's5', name: '千葉店', area: '千葉', stamps: 3 },
  { id: 's6', name: '大宮店', area: '埼玉', stamps: 10 },
];

export const TASKS: TaskDefinition[] = [
  { id: 't1', title: '週報 (4月第3週)', deadline: '2026-04-20', importance: 'medium' },
  { id: 't2', title: '在庫棚卸報告', deadline: '2025-05-31', importance: 'high' },
  { id: 't3', title: '清掃チェックリスト', deadline: '2026-04-22', importance: 'low' },
  { id: 't4', title: '夏季キャンペーン発注', deadline: '2026-05-10', importance: 'high' },
];

// 開発用の初期データ（LocalStorageがない場合のフォールバック）
export const INITIAL_STORE_TASKS: StoreTask[] = STORES.flatMap(store => 
  TASKS.map(task => ({
    id: `${store.id}-${task.id}`,
    storeId: store.id,
    taskId: task.id,
    status: Math.random() > 0.7 ? 'approved' : (Math.random() > 0.4 ? 'submitted' : 'not_started'),
    submittedAt: Math.random() > 0.4 ? '2026-04-18' : undefined,
  }))
);
