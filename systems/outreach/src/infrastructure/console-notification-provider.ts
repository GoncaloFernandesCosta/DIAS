import { randomUUID } from 'node:crypto';
import { SendRequest, SentResult } from '../domain/types';
import { NotificationProvider } from '../application/ports';

export class ConsoleNotificationProvider implements NotificationProvider {
  async send(request: SendRequest): Promise<SentResult> {
    const sentAt = new Date().toISOString();
    const result: SentResult = {
      provider: 'console',
      messageId: randomUUID(),
      status: 'sent',
      sentAt,
      to: request.to,
      channel: request.channel,
    };

    console.log('[outreach] ==========================================');
    console.log(
      `[outreach] ${request.channel.toUpperCase()} -> ${request.to} (${result.messageId})`,
    );
    if (request.subject) console.log(`[outreach] Subject: ${request.subject}`);
    console.log(`[outreach] ${request.content}`);
    console.log('[outreach] ==========================================');

    return result;
  }
}
