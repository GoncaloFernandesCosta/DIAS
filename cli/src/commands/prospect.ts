import { Command } from 'commander';
import { createLocalContainer } from '../container';

const prospectRunCommand = new Command('run')
  .description('Run a prospecting job (search + enrich + qualify)')
  .option('--industry <industry>', 'Target industry')
  .option('--region <region>', 'Target region')
  .option('--keywords <keywords>', 'Search keywords')
  .option('--limit <number>', 'Max results', '100')
  .action(async (options) => {
    const container = createLocalContainer();
    const params = {
      industry: options.industry,
      region: options.region,
      keywords: options.keywords,
      limit: Number(options.limit),
    };

    const result = await container.prospectingService.runJob(params);

    console.log('Prospecting run complete:');
    console.log(`  searched:    ${result.searched}`);
    console.log(`  enriched:    ${result.enriched}`);
    console.log(`  qualified:   ${result.qualified}`);
    console.log(`  disqualified: ${result.disqualified}`);
    console.log();

    for (const prospect of result.prospects) {
      const entity = container.workflow.ingestProspect(prospect);
      console.log(
        `  [${entity.getData().currentState}] ${prospect.companyName} (${prospect.region ?? '?'}) — ${prospect.reason}`,
      );
    }

    if (result.disqualifiedProspects.length > 0) {
      console.log();
      console.log('Disqualified:');
      for (const p of result.disqualifiedProspects) {
        console.log(`  ${p.companyName} — ${p.reason}`);
      }
    }
  });

export const prospectCommand = new Command('prospect')
  .description('Run prospecting jobs to discover companies')
  .addCommand(prospectRunCommand);
