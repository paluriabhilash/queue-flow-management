export const SOCKET_EVENTS = {
  QUEUE_TOKEN_CREATED: 'queue:token-created',
  QUEUE_TOKEN_CALLED: 'queue:token-called',
  QUEUE_TOKEN_STARTED: 'queue:token-started',
  QUEUE_TOKEN_COMPLETED: 'queue:token-completed',
  QUEUE_TOKEN_SKIPPED: 'queue:token-skipped',
  QUEUE_TOKEN_CANCELLED: 'queue:token-cancelled',
  QUEUE_TOKEN_DELETED: 'queue:token-deleted',
  QUEUE_UPDATE: 'queue:update',
} as const;

export type SocketEventType = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export interface RoomMeta {
  branchId?: string;
  serviceId?: string;
  counterId?: string;
}

export function formatRoomNames(meta: RoomMeta): string[] {
  const rooms: string[] = [];
  if (meta.branchId) rooms.push(`branch:${meta.branchId}`);
  if (meta.serviceId) rooms.push(`service:${meta.serviceId}`);
  if (meta.counterId) rooms.push(`counter:${meta.counterId}`);
  return rooms;
}
