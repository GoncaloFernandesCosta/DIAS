import { ProposalCase, ProposalState, ProposalEvents } from '@dias/contracts';

export interface CaseRepository {
  save(caseEntity: ProposalCase): void;
  findById(id: string): ProposalCase | null;
  findAll(): ProposalCase[];
  findByState(state: ProposalState): ProposalCase[];
}

export interface EventPublisher {
  publish(event: ProposalEvents): void;
}
