import { Command } from 'commander';
import { createLocalContainer } from '../container';

const siteBuildCommand = new Command('build')
  .description('Build a website for a case')
  .option('--case-id <id>', 'Proposal case ID')
  .option('--tier <tier>', 'Site tier: simple or complex', 'simple')
  .action(async (options) => {
    const container = createLocalContainer();
    const tier = options.tier === 'complex' ? 'complex' : 'simple';
    const entity = await container.workflow.buildSite(options.caseId, tier);
    const data = entity.getData();
    console.log(`[${data.currentState}] Site built for ${data.companyName}`);
    console.log(`  preview: ${data.metadata.previewUrl}`);
    console.log(`  output:  ${container.sitesRoot}/${data.id}`);
  });

export const siteCommand = new Command('site')
  .description('Build and deploy websites')
  .addCommand(siteBuildCommand);
