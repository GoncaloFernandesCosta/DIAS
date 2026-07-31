import { Command } from 'commander';
import { createLocalContainer } from '../container';

export const dashboardCommand = new Command('dashboard')
  .description('Launch the D.I.A.S dashboard UI')
  .option('--port <port>', 'HTTP port', '3000')
  .action(async (options) => {
    const port = Number(options.port);
    const container = createLocalContainer(port);
    const url = await container.dashboardServer.start();
    console.log(`D.I.A.S dashboard running at ${url}`);
    console.log(`  sites: ${container.sitesRoot}`);
    console.log('  Press Ctrl+C to stop.');
  });
