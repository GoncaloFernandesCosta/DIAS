import { randomUUID } from 'node:crypto';
import {
  ProposalCase,
  ProposalState,
  ProposalEventType,
  ProposalEvents,
} from '@dias/contracts';
import { PipelineRunParams, ProspectInput, PipelineRunSummary, CaseOutcome } from '../domain/types';
import { CaseRepository, EventPublisher } from './ports';

export interface SiteStep {
  buildSite(
    caseId: string,
    company: Record<string, unknown>,
    tier: 'simple' | 'complex',
    theme?: string,
  ): Promise<{ previewUrl: string; tier: 'simple' | 'complex' }>;
}

export interface DraftStep {
  draft(
    company: Record<string, unknown>,
    channel: 'email' | 'sms',
  ): Promise<{ channel: 'email' | 'sms'; subject?: string; draftContent: string }>;
  draftVariants(
    company: Record<string, unknown>,
    channel: 'email' | 'sms',
    count: number,
  ): Promise<Array<{ channel: 'email' | 'sms'; subject?: string; draftContent: string }>>;
}

export interface SendStep {
  send(
    company: Record<string, unknown>,
    draft: { channel: 'email' | 'sms'; subject?: string; draftContent: string },
  ): Promise<{ sentAt: string; messageId: string }>;
}

export interface ProspectStep {
  runJob(params: PipelineRunParams): Promise<{ prospects: ProspectInput[] }>;
}

export interface CaseWorkflowDeps {
  repository: CaseRepository;
  publisher: EventPublisher;
  prospectStep: ProspectStep;
  siteStep: SiteStep;
  draftStep: DraftStep;
  sendStep: SendStep;
}

export class CaseWorkflow {
  constructor(private readonly deps: CaseWorkflowDeps) {}

  ingestProspect(input: ProspectInput): ProposalCase {
    const entity = ProposalCase.discover({
      companyName: input.companyName,
      industry: input.industry,
      region: input.region,
      website: input.website,
      source: 'pipeline',
    });
    entity.markEnriched({
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      techStack: input.techStack,
      siteOutdated: input.siteOutdated,
    });
    entity.qualify({ reason: 'Qualified by prospecting rules' });
    this.commit(entity);
    return entity;
  }

  async buildSite(caseId: string, tier: 'simple' | 'complex' = 'simple', theme?: string): Promise<ProposalCase> {
    const entity = this.mustLoad(caseId);
    entity.startSiteBuild({ tier });
    this.commit(entity);

    const company = entity.getData();
    const built = await this.deps.siteStep.buildSite(caseId, company as never, tier, theme);
    entity.siteDraftReady({ previewUrl: built.previewUrl, tier: built.tier });
    entity.updateMetadata({ previewUrl: built.previewUrl, siteTier: built.tier, siteTheme: theme });
    this.commit(entity);
    return entity;
  }

  async rebuildSite(caseId: string, tier: 'simple' | 'complex' = 'simple', theme?: string): Promise<ProposalCase> {
    const entity = this.mustLoad(caseId);
    const company = entity.getData();
    const built = await this.deps.siteStep.buildSite(caseId, company as never, tier, theme);
    entity.updateMetadata({ previewUrl: built.previewUrl, siteTier: built.tier, siteTheme: theme });
    this.commit(entity);
    return entity;
  }

  async draftVariants(
    caseId: string,
    channel: 'email' | 'sms' = 'email',
    count = 3,
  ): Promise<Array<{ channel: 'email' | 'sms'; subject?: string; draftContent: string }>> {
    const entity = this.mustLoad(caseId);
    if (entity.getData().currentState !== ProposalState.SITE_DRAFT_READY) {
      throw new Error(`Cannot draft variants for case ${caseId} in state ${entity.getData().currentState}`);
    }
    const variants = await this.deps.draftStep.draftVariants(entity.getData() as never, channel, count);
    entity.updateMetadata({ draftVariants: variants, draftChannel: channel });
    this.commit(entity);
    return variants;
  }

  async chooseDraft(
    caseId: string,
    index: number,
    channel: 'email' | 'sms' = 'email',
  ): Promise<ProposalCase> {
    const entity = this.mustLoad(caseId);
    if (entity.getData().currentState !== ProposalState.SITE_DRAFT_READY) {
      throw new Error(`Cannot choose draft for case ${caseId} in state ${entity.getData().currentState}`);
    }
    const variants = entity.getData().metadata.draftVariants as
      | Array<{ channel: 'email' | 'sms'; subject?: string; draftContent: string }>
      | undefined;
    if (!variants || variants.length === 0) {
      throw new Error(`No draft variants generated for case ${caseId}`);
    }
    const chosen = variants[index];
    if (!chosen) {
      throw new Error(`Variant index ${index} out of range for case ${caseId}`);
    }
    entity.draftProposal({ channel: chosen.channel, draftContent: chosen.draftContent });
    entity.updateMetadata({
      draftContent: chosen.draftContent,
      draftChannel: chosen.channel,
      draftSubject: chosen.subject,
    });
    this.commit(entity);
    return entity;
  }

  async draft(caseId: string, channel: 'email' | 'sms' = 'email'): Promise<ProposalCase> {
    const entity = this.mustLoad(caseId);
    if (entity.getData().currentState === ProposalState.SITE_DRAFT_READY) {
      const draft = await this.deps.draftStep.draft(entity.getData() as never, channel);
      entity.draftProposal({ channel: draft.channel, draftContent: draft.draftContent });
      entity.updateMetadata({ draftContent: draft.draftContent, draftChannel: draft.channel });
      this.commit(entity);
    }
    return entity;
  }

  approve(caseId: string, approvedBy = 'cli'): ProposalCase {
    const entity = this.mustLoad(caseId);
    if (entity.getData().currentState === ProposalState.PROPOSAL_DRAFTED) {
      entity.approve({ approvedBy });
      this.commit(entity);
    }
    return entity;
  }

  async send(caseId: string, channel: 'email' | 'sms' = 'email'): Promise<ProposalCase> {
    const entity = this.mustLoad(caseId);
    const state = entity.getData().currentState;

    if (state === ProposalState.SITE_DRAFT_READY) {
      const draft = await this.deps.draftStep.draft(entity.getData() as never, channel);
      entity.draftProposal({ channel: draft.channel, draftContent: draft.draftContent });
      entity.updateMetadata({ draftContent: draft.draftContent, draftChannel: draft.channel });
    }
    if (entity.getData().currentState === ProposalState.PROPOSAL_DRAFTED) {
      entity.approve({ approvedBy: 'cli' });
    }
    this.commit(entity);

    const draftContent = entity.getData().metadata.draftContent as string | undefined;
    if (!draftContent) {
      throw new Error(`No proposal draft available for case ${caseId}`);
    }
    const sent = await this.deps.sendStep.send(entity.getData() as never, {
      channel,
      draftContent,
    });
    entity.send({ channel, sentAt: sent.sentAt });
    entity.updateMetadata({ sentAt: sent.sentAt, messageId: sent.messageId });
    this.commit(entity);
    return entity;
  }

  win(caseId: string, dealValue?: number): ProposalCase {
    const entity = this.mustLoad(caseId);
    entity.markWon(dealValue !== undefined ? { dealValue } : {});
    this.commit(entity);
    return entity;
  }

  async advanceToStage(
    caseId: string,
    targetStage: string,
  ): Promise<ProposalCase> {
    const entity = this.mustLoad(caseId);
    const state = entity.getData().currentState;

    switch (targetStage) {
      case 'building':
        if (state === ProposalState.QUALIFIED) {
          return this.buildSite(caseId);
        }
        break;
      case 'proposal':
        if (state === ProposalState.QUALIFIED) {
          await this.buildSite(caseId);
        }
        if (state === ProposalState.SITE_DRAFT_READY || this.mustLoad(caseId).getData().currentState === ProposalState.SITE_DRAFT_READY) {
          await this.draft(caseId);
        }
        break;
      case 'outreach':
        if (state === ProposalState.QUALIFIED) {
          await this.buildSite(caseId);
        }
        if (this.mustLoad(caseId).getData().currentState === ProposalState.SITE_DRAFT_READY) {
          await this.draft(caseId);
        }
        if (this.mustLoad(caseId).getData().currentState === ProposalState.PROPOSAL_DRAFTED) {
          this.approve(caseId, 'drag-drop');
        }
        if (this.mustLoad(caseId).getData().currentState === ProposalState.PROPOSAL_APPROVED) {
          await this.send(caseId);
        }
        break;
      case 'followup':
        if (state === ProposalState.PROPOSAL_SENT) {
          // Can't fabricate a response; leaving in place is the honest behavior.
        }
        break;
      default:
        break;
    }

    return this.mustLoad(caseId);
  }

  lose(caseId: string, reason?: string): ProposalCase {
    const entity = this.mustLoad(caseId);
    entity.markLost(reason ? { reason } : {});
    this.commit(entity);
    return entity;
  }

  async run(params: PipelineRunParams): Promise<PipelineRunSummary> {
    return this.runThrough(params, 'send');
  }

  async runThrough(
    params: PipelineRunParams,
    stopAt: 'prospect' | 'site' | 'draft' | 'send',
  ): Promise<PipelineRunSummary> {
    const runId = randomUUID();
    const result = await this.deps.prospectStep.runJob(params);

    const summary: PipelineRunSummary = {
      runId,
      total: result.prospects.length,
      sent: 0,
      failed: 0,
      cases: [],
      errors: [],
    };

    for (const prospect of result.prospects) {
      try {
        const entity = this.ingestProspect(prospect);
        const id = entity.getData().id;

        if (stopAt === 'prospect') {
          summary.cases.push({
            caseId: id,
            companyName: prospect.companyName,
            currentState: entity.getData().currentState,
          });
          continue;
        }

        await this.buildSite(id, params.tier ?? 'simple', params.theme);
        if (stopAt === 'site') {
          summary.cases.push({
            caseId: id,
            companyName: prospect.companyName,
            currentState: this.mustLoad(id).getData().currentState,
            previewUrl: this.mustLoad(id).getData().metadata.previewUrl as string | undefined,
          });
          continue;
        }

        await this.draft(id, 'email');
        if (stopAt === 'draft') {
          summary.cases.push({
            caseId: id,
            companyName: prospect.companyName,
            currentState: this.mustLoad(id).getData().currentState,
            previewUrl: this.mustLoad(id).getData().metadata.previewUrl as string | undefined,
          });
          continue;
        }

        this.approve(id, 'auto');
        await this.send(id, 'email');
        const final = this.mustLoad(id);
        summary.sent += 1;
        summary.cases.push({
          caseId: id,
          companyName: prospect.companyName,
          currentState: final.getData().currentState,
          previewUrl: final.getData().metadata.previewUrl as string | undefined,
          sentAt: final.getData().metadata.sentAt as string | undefined,
        });
      } catch (error) {
        summary.failed += 1;
        summary.errors.push({
          caseId: prospect.companyName,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return summary;
  }

  async prospectOnly(params: PipelineRunParams): Promise<PipelineRunSummary> {
    return this.runThrough(params, 'prospect');
  }

  private mustLoad(caseId: string): ProposalCase {
    const entity = this.deps.repository.findById(caseId);
    if (!entity) {
      throw new Error(`Case ${caseId} not found`);
    }
    return entity;
  }

  private commit(entity: ProposalCase): void {
    this.deps.repository.save(entity);
    for (const event of entity.drainEvents()) {
      this.deps.publisher.publish(event);
    }
  }
}
