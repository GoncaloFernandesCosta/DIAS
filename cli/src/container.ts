import { resolve } from 'node:path';
import { ProposalCaseData, ProposalState } from '@dias/contracts';
import { ProspectingService } from '@dias/prospecting';
import { LocalSearchAdapter } from '@dias/prospecting';
import { StaticEnrichmentAdapter } from '@dias/prospecting';
import { SiteBuilderService } from '@dias/site-builder';
import { StaticHtmlSiteRenderer } from '@dias/site-builder';
import { OutreachService } from '@dias/outreach';
import { TemplateMessageGenerator } from '@dias/outreach';
import { ConsoleNotificationProvider } from '@dias/outreach';
import { CaseWorkflow } from '@dias/pipeline';
import { SqliteCaseRepository } from '@dias/pipeline';
import { InMemoryEventBus } from '@dias/pipeline';
import { DashboardService } from '@dias/dashboard';
import { DashboardServer } from '@dias/dashboard';
import type { CaseWorkflowDeps } from '@dias/pipeline';
import type { ProposalEvents } from '@dias/contracts';

export interface DiasContainer {
  workflow: CaseWorkflow;
  repository: SqliteCaseRepository;
  eventBus: InMemoryEventBus;
  dashboardService: DashboardService;
  dashboardServer: DashboardServer;
  prospectingService: ProspectingService;
  sitesRoot: string;
}

export function buildContainer(options: {
  dataDir: string;
  sitesRoot: string;
  dashboardPort: number;
}): DiasContainer {
  const repository = new SqliteCaseRepository(resolve(options.dataDir, 'dias.db'));
  const eventBus = new InMemoryEventBus();

  const prospectingService = new ProspectingService(
    new LocalSearchAdapter(),
    new StaticEnrichmentAdapter(),
  );

  const siteBuilder = new SiteBuilderService(
    new StaticHtmlSiteRenderer({
      sitesRoot: options.sitesRoot,
      previewBaseUrl: `/sites`,
    }),
  );

  const outreach = new OutreachService(
    new TemplateMessageGenerator(),
    new ConsoleNotificationProvider(),
  );

  const deps: CaseWorkflowDeps = {
    repository,
    publisher: eventBus,
    prospectStep: {
      runJob: (params) => prospectingService.runJob(params),
    },
    siteStep: {
      buildSite: async (caseId, company, tier) => {
        const built = await siteBuilder.buildSite(company as unknown as ProposalCaseData, tier);
        return { previewUrl: built.previewUrl, tier: built.tier };
      },
    },
    draftStep: {
      draft: async (company, channel) => {
        const draft = await outreach.draft(company as unknown as ProposalCaseData, channel);
        return { channel: draft.channel, subject: draft.subject, draftContent: draft.draftContent };
      },
    },
    sendStep: {
      send: async (company, draft) => {
        const sent = await outreach.send(company as unknown as ProposalCaseData, draft);
        return { sentAt: sent.sentAt, messageId: sent.messageId };
      },
    },
  };

  const workflow = new CaseWorkflow(deps);

  const dashboardService = new DashboardService(repository, workflow);
  const dashboardServer = new DashboardServer(dashboardService, {
    port: options.dashboardPort,
    sitesRoot: options.sitesRoot,
  });

  return {
    workflow,
    repository,
    eventBus,
    dashboardService,
    dashboardServer,
    prospectingService,
    sitesRoot: options.sitesRoot,
  };
}

export function createLocalContainer(dashboardPort = 3000): DiasContainer {
  const repoRoot = resolve(__dirname, '..', '..');
  return buildContainer({
    dataDir: process.env.DIAS_DATA_DIR ?? resolve(repoRoot, '.dias', 'data'),
    sitesRoot: process.env.DIAS_SITES_DIR ?? resolve(repoRoot, '.dias', 'sites'),
    dashboardPort,
  });
}
