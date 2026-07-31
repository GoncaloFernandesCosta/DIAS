import { Command } from 'commander';
import { createLocalContainer } from '../container';

const outreachSendCommand = new Command('send')
  .description('Draft, approve and send outreach for a case')
  .option('--case-id <id>', 'Proposal case ID')
  .option('--channel <channel>', 'Channel: email or sms', 'email')
  .action(async (options) => {
    const container = createLocalContainer();
    const channel = options.channel === 'sms' ? 'sms' : 'email';
    const entity = await container.workflow.send(options.caseId, channel);
    const data = entity.getData();
    console.log(`[${data.currentState}] Outreach sent to ${data.companyName}`);
    console.log(`  to:      ${data.contactEmail ?? data.contactPhone}`);
    console.log(`  sent at: ${data.metadata.sentAt}`);
    console.log(`  message: ${data.metadata.messageId}`);
  });

export const outreachCommand = new Command('outreach')
  .description('Send outreach messages (email/SMS)')
  .addCommand(outreachSendCommand);
