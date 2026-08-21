import {
  createDeploymentRecord,
  mockDeployments,
  type Deployment,
  type DeploymentDraft
} from '../data/deploymentData';

export interface DeploymentService {
  deployModel(draft: DeploymentDraft, modelVersion: string): Promise<Deployment>;
  getDeployments(): Promise<Deployment[]>;
  getDeployment(id: string): Promise<Deployment | undefined>;
  updateDeployment(id: string, updates: Partial<Deployment>): Promise<Deployment | undefined>;
  deleteDeployment(id: string): Promise<void>;
  regenerateApiKey(id: string): Promise<Deployment | undefined>;
  getDeploymentMetrics(id: string): Promise<Deployment['metrics'] | undefined>;
}

const deploymentStore = [...mockDeployments];

export const MockDeploymentService: DeploymentService = {
  async deployModel(draft, modelVersion) {
    const deployment = createDeploymentRecord(draft, modelVersion);
    deploymentStore.unshift(deployment);
    return deployment;
  },

  async getDeployments() {
    return [...deploymentStore];
  },

  async getDeployment(id) {
    return deploymentStore.find((deployment) => deployment.id === id);
  },

  async updateDeployment(id, updates) {
    const index = deploymentStore.findIndex((deployment) => deployment.id === id);
    if (index < 0) return undefined;
    deploymentStore[index] = { ...deploymentStore[index], ...updates };
    return deploymentStore[index];
  },

  async deleteDeployment(id) {
    const index = deploymentStore.findIndex((deployment) => deployment.id === id);
    if (index >= 0) deploymentStore.splice(index, 1);
  },

  async regenerateApiKey(id) {
    const deployment = deploymentStore.find((item) => item.id === id);
    if (!deployment) return undefined;
    deployment.api = { ...deployment.api, apiKey: `mv_test_${Math.random().toString(36).slice(2, 17)}` };
    return deployment;
  },

  async getDeploymentMetrics(id) {
    return (await this.getDeployment(id))?.metrics;
  }
};
