#!/usr/bin/env node

import { Command } from 'commander';
import { prospectCommand } from './commands/prospect';
import { outreachCommand } from './commands/outreach';
import { siteCommand } from './commands/site';
import { pipelineCommand } from './commands/pipeline';
import { dashboardCommand } from './commands/dashboard';

const program = new Command();

program
  .name('dias')
  .description('D.I.A.S — Dynamic Intelligent Assistant Software')
  .version('0.1.0');

program.addCommand(prospectCommand);
program.addCommand(outreachCommand);
program.addCommand(siteCommand);
program.addCommand(pipelineCommand);
program.addCommand(dashboardCommand);

program.parse(process.argv);
