import type { LeadResult, LeadSourceId } from '@dias/lead-sources';

export interface SavedLead extends LeadResult {
  id: string;
  savedAt: string;
  status: 'new' | 'contacted' | 'responded' | 'won' | 'lost';
  note?: string;
}

export type LeadStatus = SavedLead['status'];

export interface DashboardStats {
  total: number;
  new: number;
  contacted: number;
  responded: number;
  won: number;
  lost: number;
  contactRate: number;
  winRate: number;
}

export interface SourceConfig {
  id: LeadSourceId;
  name: string;
  description: string;
  icon: string;
  configured: boolean;
  needsKey: string[];
}

export type { LeadResult, LeadSearchParams } from '@dias/lead-sources';
export type { LeadSourceId as LeadSourceId } from '@dias/lead-sources';