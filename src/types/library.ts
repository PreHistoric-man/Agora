import type { Model } from '../data/mockData';

export type DeploymentStatus =
  | 'not_deployed'
  | 'deploying'
  | 'running'
  | 'stopped'
  | 'failed';

export interface LibraryItem {
  id: string; // UUID primary key
  user_id: string;
  model_id: string;
  added_at: string;
  installed: boolean;
  installed_version?: string | null;
  deployment_status: DeploymentStatus;
  created_at?: string;
  updated_at?: string;
  model?: Model; // Joined model metadata
}

/**
 * Shape expected by the future ModalHub Desktop Launcher
 */
export interface LauncherLibraryEntry {
  model_id: string;
  name: string;
  installed: boolean;
  installed_version: string | null;
  deployment_status: DeploymentStatus;
}
