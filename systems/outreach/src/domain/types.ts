import { ProposalCaseData } from '@dias/contracts';

export type MessageChannel = 'email' | 'sms';

export interface DraftMessage {
  channel: MessageChannel;
  subject?: string;
  draftContent: string;
}

export interface SendRequest {
  to: string;
  channel: MessageChannel;
  subject?: string;
  content: string;
}

export interface SentResult {
  provider: string;
  messageId: string;
  status: 'sent';
  sentAt: string;
  to: string;
  channel: MessageChannel;
}

export interface DraftContext {
  company: ProposalCaseData;
}
