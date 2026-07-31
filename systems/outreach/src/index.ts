export { OutreachService } from './application/outreach-service';
export type { MessageGenerator, NotificationProvider } from './application/ports';
export type {
  MessageChannel,
  DraftMessage,
  SendRequest,
  SentResult,
  DraftContext,
} from './domain/types';
export { TemplateMessageGenerator } from './infrastructure/template-message-generator';
export { ConsoleNotificationProvider } from './infrastructure/console-notification-provider';
export { draftForCase, sendForCase } from './interface/outreach-runner';
