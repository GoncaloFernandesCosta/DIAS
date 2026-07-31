import { ProposalCaseData } from '@dias/contracts';
import {
  DraftMessage,
  MessageChannel,
  SendRequest,
  SentResult,
} from '../domain/types';
import { MessageGenerator, NotificationProvider } from './ports';

export class OutreachService {
  constructor(
    private readonly generator: MessageGenerator,
    private readonly notificationProvider: NotificationProvider,
  ) {}

  async draft(company: ProposalCaseData, channel: MessageChannel = 'email'): Promise<DraftMessage> {
    return this.generator.draft({ company }, channel);
  }

  async send(company: ProposalCaseData, draft: DraftMessage): Promise<SentResult> {
    const to = company.contactEmail ?? company.contactPhone;
    if (!to) {
      throw new Error(`No contact destination for case ${company.id}`);
    }

    const request: SendRequest = {
      to,
      channel: draft.channel,
      subject: draft.subject,
      content: draft.draftContent,
    };
    return this.notificationProvider.send(request);
  }
}
