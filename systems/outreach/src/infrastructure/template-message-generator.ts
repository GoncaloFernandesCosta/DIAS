import { DraftContext, DraftMessage } from '../domain/types';
import { MessageGenerator } from '../application/ports';

export class TemplateMessageGenerator implements MessageGenerator {
  async draft(context: DraftContext, channel: 'email' | 'sms'): Promise<DraftMessage> {
    return channel === 'sms'
      ? this.draftSms(context)
      : this.draftEmail(context);
  }

  async draftVariants(
    context: DraftContext,
    channel: 'email' | 'sms',
    count: number,
  ): Promise<DraftMessage[]> {
    const variants: DraftMessage[] = [];
    const n = Math.max(1, Math.min(count, 6));
    for (let i = 0; i < n; i++) {
      variants.push(
        channel === 'sms' ? this.draftSmsVariant(context, i) : this.draftEmailVariant(context, i),
      );
    }
    return variants;
  }

  private draftEmail(ctx: DraftContext): DraftMessage {
    return this.draftEmailVariant(ctx, 0);
  }

  private draftSms(ctx: DraftContext): DraftMessage {
    return this.draftSmsVariant(ctx, 0);
  }

  private draftEmailVariant(ctx: DraftContext, index: number): DraftMessage {
    const c = ctx.company;
    const greeting = c.contactEmail ? `Hi ${c.companyName} team,` : `Hello ${c.companyName} team,`;
    const siteNote = c.siteOutdated
      ? `During our research we noticed your current online presence could better reflect the quality of your ${c.industry ?? 'business'}.`
      : `We have put together a fresh proposal to help your ${c.industry ?? 'business'} stand out online.`;

    const subjects = [
      `Fresh website proposal for ${c.companyName}`,
      `A modern website concept for ${c.companyName}`,
      `Quick idea to grow ${c.companyName} online`,
      `${c.companyName}: new website preview inside`,
      `Let's modernize ${c.companyName} together`,
    ];
    const openings = [
      'We have prepared a brand-new website concept and a tailored proposal for',
      'We built a fast, modern website draft for',
      'Our team put together a fresh online presence for',
    ];
    const closings = [
      'You can review the preview and the full proposal on your dashboard. If it looks interesting, simply reply and we will get started right away.',
      'Take a look at the preview — if you like what you see, just reply and we will bring it live.',
      'No pressure: reply if you would like us to take it further for',
    ];

    const subject = subjects[index % subjects.length];
    const opening = openings[index % openings.length];
    const closing = closings[index % closings.length];

    const draftContent = `${greeting}\n\n${siteNote}\n\n${opening} ${c.companyName} — modern, fast, and built to bring you more customers in ${c.region ?? 'your area'}.\n\n${closing} ${c.companyName}.\n\nBest regards,\nThe D.I.A.S Team`;

    return { channel: 'email', subject, draftContent };
  }

  private draftSmsVariant(ctx: DraftContext, index: number): DraftMessage {
    const c = ctx.company;
    const templates = [
      `${c.companyName} — we have a modern website + proposal ready for you. Preview it and reply YES to get started!`,
      `Hi ${c.companyName}! We designed a fresh website for you. Reply YES and we will launch it this week.`,
      `${c.companyName}, ready for a faster, modern site? Preview ready now — reply YES to go ahead.`,
    ];
    return {
      channel: 'sms',
      draftContent: templates[index % templates.length],
    };
  }
}
