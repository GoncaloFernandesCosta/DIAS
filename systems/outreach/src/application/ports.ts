import { DraftContext, DraftMessage, SendRequest, SentResult } from '../domain/types';

export interface MessageGenerator {
  draft(context: DraftContext, channel: 'email' | 'sms'): Promise<DraftMessage>;
}

export interface NotificationProvider {
  send(request: SendRequest): Promise<SentResult>;
}
