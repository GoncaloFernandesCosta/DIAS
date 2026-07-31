import { ProposalCaseData } from '@dias/contracts';
import { DraftMessage, MessageChannel, SentResult } from '../domain/types';
import { OutreachService } from '../application/outreach-service';

export async function draftForCase(
  service: OutreachService,
  company: ProposalCaseData,
  channel: MessageChannel,
): Promise<DraftMessage> {
  return service.draft(company, channel);
}

export async function sendForCase(
  service: OutreachService,
  company: ProposalCaseData,
  draft: DraftMessage,
): Promise<SentResult> {
  return service.send(company, draft);
}
