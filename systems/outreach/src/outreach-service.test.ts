import { describe, it, expect } from 'vitest';
import { ProposalCase } from '@dias/contracts';
import { OutreachService } from './application/outreach-service';
import { TemplateMessageGenerator } from './infrastructure/template-message-generator';
import { ConsoleNotificationProvider } from './infrastructure/console-notification-provider';
import { NotificationProvider, MessageGenerator } from './application/ports';
import { SendRequest, SentResult } from './domain/types';

class RecordingNotificationProvider implements NotificationProvider {
  requests: SendRequest[] = [];

  async send(request: SendRequest): Promise<SentResult> {
    this.requests.push(request);
    return {
      provider: 'test',
      messageId: 'msg-1',
      status: 'sent',
      sentAt: new Date().toISOString(),
      to: request.to,
      channel: request.channel,
    };
  }
}

function makeOutdatedCompany(name = 'TestCo') {
  const entity = ProposalCase.discover({
    companyName: name,
    industry: 'restaurants',
    region: 'Lisbon',
    website: 'https://old.example.com',
    source: 'test',
  });
  entity.markEnriched({
    contactEmail: 'contact@testco.pt',
    techStack: ['php'],
    siteOutdated: true,
  });
  return entity.getData();
}

describe('OutreachService', () => {
  it('drafts a personalized email mentioning the company and outdated site', async () => {
    const service = new OutreachService(
      new TemplateMessageGenerator(),
      new RecordingNotificationProvider(),
    );
    const company = makeOutdatedCompany('Casa Velha');
    const draft = await service.draft(company, 'email');

    expect(draft.channel).toBe('email');
    expect(draft.subject).toContain('Casa Velha');
    expect(draft.draftContent).toContain('Casa Velha');
    expect(draft.draftContent).toContain('online presence');
    expect(draft.draftContent).toContain('restaurants');
  });

  it('drafts an SMS without subject', async () => {
    const service = new OutreachService(
      new TemplateMessageGenerator(),
      new RecordingNotificationProvider(),
    );
    const draft = await service.draft(makeOutdatedCompany(), 'sms');

    expect(draft.channel).toBe('sms');
    expect(draft.subject).toBeUndefined();
    expect(draft.draftContent).toContain('reply');
  });

  it('generates multiple distinct email variants', async () => {
    const service = new OutreachService(
      new TemplateMessageGenerator(),
      new RecordingNotificationProvider(),
    );
    const company = makeOutdatedCompany('Casa Velha');
    const variants = await service.draftVariants(company, 'email', 3);

    expect(variants).toHaveLength(3);
    expect(variants.every((v) => v.channel === 'email')).toBe(true);
    expect(variants.every((v) => v.draftContent.includes('Casa Velha'))).toBe(true);
    const subjects = new Set(variants.map((v) => v.subject));
    expect(subjects.size).toBe(3);
    const contents = new Set(variants.map((v) => v.draftContent));
    expect(contents.size).toBe(3);
  });

  it('generates multiple distinct SMS variants', async () => {
    const service = new OutreachService(
      new TemplateMessageGenerator(),
      new RecordingNotificationProvider(),
    );
    const variants = await service.draftVariants(makeOutdatedCompany(), 'sms', 3);

    expect(variants).toHaveLength(3);
    expect(variants.every((v) => v.channel === 'sms')).toBe(true);
    const contents = new Set(variants.map((v) => v.draftContent));
    expect(contents.size).toBe(3);
  });

  it('caps variants to six and honours a minimum of one', async () => {
    const service = new OutreachService(
      new TemplateMessageGenerator(),
      new RecordingNotificationProvider(),
    );
    const capped = await service.draftVariants(makeOutdatedCompany(), 'email', 99);
    expect(capped).toHaveLength(6);

    const minimum = await service.draftVariants(makeOutdatedCompany(), 'email', 0);
    expect(minimum).toHaveLength(1);
  });

  it('sends to the contact email via the notification provider', async () => {
    const provider = new RecordingNotificationProvider();
    const service = new OutreachService(new TemplateMessageGenerator(), provider);
    const company = makeOutdatedCompany();
    const draft = await service.draft(company, 'email');
    const result = await service.send(company, draft);

    expect(result.status).toBe('sent');
    expect(result.to).toBe(company.contactEmail);
    expect(provider.requests).toHaveLength(1);
    expect(provider.requests[0].content).toBe(draft.draftContent);
  });

  it('throws when there is no contact destination', async () => {
    const service = new OutreachService(
      new TemplateMessageGenerator(),
      new RecordingNotificationProvider(),
    );
    const company = ProposalCase.discover({
      companyName: 'Ghost Co',
      website: 'https://ghost.example.com',
      source: 'test',
    }).getData();
    company.contactEmail = undefined;
    company.contactPhone = undefined;

    const draft = await service.draft(company, 'email');
    await expect(service.send(company, draft)).rejects.toThrow(/No contact destination/);
  });

  it('supports custom message generators via the port', async () => {
    class CustomGenerator implements MessageGenerator {
      async draft(_ctx: any, channel: any) {
        return { channel, draftContent: 'custom draft' };
      }
      async draftVariants(_ctx: any, channel: any, count: number) {
        return Array.from({ length: count }, () => ({ channel, draftContent: 'variant' }));
      }
    }
    const provider = new RecordingNotificationProvider();
    const service = new OutreachService(new CustomGenerator(), provider);
    const draft = await service.draft(makeOutdatedCompany(), 'email');
    expect(draft.draftContent).toBe('custom draft');
  });

  it('console provider logs and returns a message id', async () => {
    const service = new OutreachService(
      new TemplateMessageGenerator(),
      new ConsoleNotificationProvider(),
    );
    const company = makeOutdatedCompany();
    const draft = await service.draft(company, 'email');
    const result = await service.send(company, draft);

    expect(result.provider).toBe('console');
    expect(result.messageId).toBeTruthy();
  });
});
