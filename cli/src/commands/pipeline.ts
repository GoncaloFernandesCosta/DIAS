import { Command } from 'commander';
import { createLocalContainer } from '../container';

const pipelineRunCommand = new Command('run')
  .description('Run the full prospecting-to-outreach pipeline')
  .option('--industry <industry>', 'Target industry')
  .option('--region <region>', 'Target region')
  .option('--keywords <keywords>', 'Search keywords')
  .option('--limit <number>', 'Max prospects', '50')
  .option('--tier <tier>', 'Site tier: simple or complex', 'simple')
  .option('--theme <theme>', 'Theme id (e.g. modern-teal, deep-navy, warm-terracotta)')
  .option(
    '--stage <stage>',
    'Stop after this stage: prospect | site | draft | send',
    'send',
  )
  .action(async (options) => {
    const container = createLocalContainer();
    const base = {
      industry: options.industry,
      region: options.region,
      keywords: options.keywords,
      limit: Number(options.limit),
      tier: options.tier,
      theme: options.theme,
    };
    const stopAt = options.stage === 'site' || options.stage === 'draft' ? options.stage : 'send';
    const summary = await container.workflow.runThrough(base, options.stage === 'prospect' ? 'prospect' : stopAt);

    console.log(`Pipeline run ${summary.runId} complete (stage: ${options.stage}):`);
    console.log(`  total:   ${summary.total}`);
    if (options.stage === 'send') console.log(`  sent:    ${summary.sent}`);
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
    if (stopAt === 'site' || stopAt === 'draft') {
      console.log();
      console.log(`Hint: run "dias site build --case-id <id>" or "dias outreach send --case-id <id>" to continue per case.`);
    }
  });

export const pipelineCommand = new Command('pipeline')
  .description('Coordinate the full D.I.A.S workflow')
  .addCommand(pipelineRunCommand);
