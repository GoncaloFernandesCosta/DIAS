import { Command } from 'commander';
import { createLocalContainer } from '../container';

const pipelineRunCommand = new Command('run')
  .description('Run the full prospecting-to-outreach pipeline')
  .option('--industry <industry>', 'Target industry')
  .option('--region <region>', 'Target region')
  .option('--keywords <keywords>', 'Search keywords')
  .option('--limit <number>', 'Max prospects', '50')
  .option('--tier <tier>', 'Site tier: simple or complex', 'simple')
  .action(async (options) => {
    const container = createLocalContainer();
    const summary = await container.workflow.run({
      industry: options.industry,
      region: options.region,
      keywords: options.keywords,
      limit: Number(options.limit),
      tier: options.tier,
    });

    console.log(`Pipeline run ${summary.runId} complete:`);
    console.log(`  total:   ${summary.total}`);
    console.log(`  sent:    ${summary.sent}`);
    console.log(`  failed:  ${summary.failed}`);
    console.log();

    for (const c of summary.cases) {
      console.log(`  [${c.currentState}] ${c.companyName}`);
      if (c.previewUrl) console.log(`      preview: ${c.previewUrl}`);
      if (c.sentAt) console.log(`      sent: ${c.sentAt}`);
    }
    if (summary.errors.length > 0) {
      console.log();
      console.log('Errors:');
      for (const e of summary.errors) console.log(`  ${e.caseId}: ${e.message}`);
    }
  });

export const pipelineCommand = new Command('pipeline')
  .description('Coordinate the full D.I.A.S workflow')
  .addCommand(pipelineRunCommand);
