import { DraftContext, DraftMessage } from '../domain/types';
import { MessageGenerator } from '../application/ports';

export class TemplateMessageGenerator implements MessageGenerator {
  async draft(context: DraftContext, channel: 'email' | 'sms'): Promise<DraftMessage> {
    return channel === 'sms'
      ? this.draftSms(context)
      : this.draftEmail(context);
  }

  private draftEmail(ctx: DraftContext): DraftMessage {
    const c = ctx.company;
    const greeting = c.contactEmail ? `Hi ${c.companyName} team,` : `Hello ${c.companyName} team,`;
    const siteNote = c.siteOutdated
      ? `During our research we noticed your current online presence could better reflect the quality of your ${c.industry ?? 'business'}.`
      : `We have put together a fresh proposal to help your ${c.industry ?? 'business'} stand out online.`;

    const draftContent = `${greeting}\n\n${siteNote}\n\nWe have prepared a brand-new website concept and a tailored proposal for ${c.companyName} — modern, fast, and built to bring you more customers in ${c.region ?? 'your area'}.\n\nYou can review the preview and the full proposal on your dashboard. If it looks interesting, simply reply and we will get started right away.\n\nBest regards,\nThe D.I.A.S Team`;

    return {
      channel: 'email',
      subject: `Fresh website proposal for ${c.companyName}`,
      draftContent,
    };
  }

  private draftSms(ctx: DraftContext): DraftMessage {
    const c = ctx.company;
    const draftContent = `${c.companyName} — we have a modern website + proposal ready for you. Preview it and reply YES to get started!`;
    return {
      channel: 'sms',
      draftContent,
    };
  }
}
