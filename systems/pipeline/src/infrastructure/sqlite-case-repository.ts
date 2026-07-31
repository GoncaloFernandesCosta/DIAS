import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  ProposalCase,
  ProposalCaseData,
  ProposalState,
  ProposalEvents,
} from '@dias/contracts';
import { CaseRepository } from '../application/ports';

export class SqliteCaseRepository implements CaseRepository {
  private db: DatabaseSync;

  constructor(private readonly dbPath: string) {
    mkdirSync(dirname(dbPath), { recursive: true });
    this.db = new DatabaseSync(dbPath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        current_state TEXT NOT NULL,
        company_name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS case_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        payload TEXT NOT NULL,
        occurred_at TEXT NOT NULL
      );
    `);
  }

  save(caseEntity: ProposalCase): void {
    const d = caseEntity.getData();
    const upsert = this.db.prepare(`
      INSERT INTO cases (id, data, current_state, company_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        data = excluded.data,
        current_state = excluded.current_state,
        company_name = excluded.company_name,
        updated_at = excluded.updated_at
    `);
    upsert.run(
      d.id,
      JSON.stringify(d),
      d.currentState,
      d.companyName,
      d.createdAt,
      d.updatedAt,
    );

    const insertEvent = this.db.prepare(`
      INSERT INTO case_events (case_id, event_type, payload, occurred_at)
      VALUES (?, ?, ?, ?)
    `);
    for (const event of caseEntity.getEvents()) {
      insertEvent.run(d.id, event.eventType, JSON.stringify(event.payload), event.occurredAt);
    }
  }

  findById(id: string): ProposalCase | null {
    const row = this.db.prepare('SELECT data FROM cases WHERE id = ?').get(id) as
      | { data: string }
      | undefined;
    if (!row) return null;
    return ProposalCase.load(JSON.parse(row.data) as ProposalCaseData);
  }

  findAll(): ProposalCase[] {
    const rows = this.db.prepare('SELECT data FROM cases ORDER BY created_at ASC').all() as {
      data: string;
    }[];
    return rows.map((row) => ProposalCase.load(JSON.parse(row.data) as ProposalCaseData));
  }

  findByState(state: ProposalState): ProposalCase[] {
    const rows = this.db
      .prepare('SELECT data FROM cases WHERE current_state = ? ORDER BY updated_at DESC')
      .all(state) as { data: string }[];
    return rows.map((row) => ProposalCase.load(JSON.parse(row.data) as ProposalCaseData));
  }

  close(): void {
    this.db.close();
  }
}
