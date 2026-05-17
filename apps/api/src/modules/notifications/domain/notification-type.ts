export const NotificationType = {
  PROPOSAL_RECEIVED: 'PROPOSAL_RECEIVED',
  REQUEST_RESPONSE: 'REQUEST_RESPONSE',
  ACTIVITY_INTERACTION: 'ACTIVITY_INTERACTION',
  REQUEST_OR_PROPOSAL_UPDATE: 'REQUEST_OR_PROPOSAL_UPDATE',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationEntityType = {
  OPEN_REQUEST: 'open_request',
  PROPOSAL: 'proposal',
} as const;

export type NotificationEntityType = (typeof NotificationEntityType)[keyof typeof NotificationEntityType];
