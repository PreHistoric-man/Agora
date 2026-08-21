import type { Model } from '../data/mockData';
import type { LibraryItem } from './library';
import type { Deployment } from './deployment';

export type LauncherViewType =
  | 'home'
  | 'library'
  | 'deployments'
  | 'store'
  | 'settings';

export type ModelRuntimeState =
  | 'not_installed'
  | 'installing'
  | 'installed'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'failed';

export interface LauncherModelDisplay extends Model {
  libraryItem?: LibraryItem;
  runtimeState: ModelRuntimeState;
  installedSizeGb?: number;
  localPath?: string;
  activeDeployments?: Deployment[];
}
