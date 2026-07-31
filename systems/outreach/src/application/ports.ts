import { DraftContext, DraftMessage, SendRequest, SentResult } from '../domain/types';

export interface MessageGenerator {
  draft(context: DraftContext, channel: 'email' | 'sms'): Promise<DraftMessage>;
  draftVariants(
    context: DraftContext,
    channel: 'email' | 'sms',
    count: number,
  ): Promise<DraftMessage[]>;
}

export interface NotificationProvider {
  send(request: SendRequest): Promise<SentResult>;
}
