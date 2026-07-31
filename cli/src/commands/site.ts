import { Command } from 'commander';
import { createLocalContainer } from '../container';

const siteBuildCommand = new Command('build')
  .description('Build a website for a case')
  .option('--case-id <id>', 'Proposal case ID')
  .option('--tier <tier>', 'Site tier: simple or complex', 'simple')
  .option('--theme <theme>', 'Theme id (e.g. modern-teal, deep-navy, warm-terracotta)')
  .option('--rebuild', 'Re-render an existing site with the given options')
  .action(async (options) => {
    const container = createLocalContainer();
    const tier = options.tier === 'complex' ? 'complex' : 'simple';
    const entity = options.rebuild
      ? await container.workflow.rebuildSite(options.caseId, tier, options.theme)
      : await container.workflow.buildSite(options.caseId, tier, options.theme);
    const data = entity.getData();
    console.log(`[${data.currentState}] Site built for ${data.companyName}`);
    console.log(`  preview: ${data.metadata.previewUrl}`);
    console.log(`  output:  ${container.sitesRoot}/${data.id}`);
    console.log(`  theme:   ${data.metadata.siteTheme ?? 'auto (industry)'}`);
  });

export const siteCommand = new Command('site')
  .description('Build and deploy websites')
  .addCommand(siteBuildCommand);
