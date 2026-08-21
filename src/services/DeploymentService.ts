import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Deployment, DeploymentDraft, DeploymentStatus } from '../types/deployment';
import type { Model } from '../data/mockData';
import { mockModels } from '../data/mockData';

const LOCAL_DEPLOYMENTS_STORAGE_KEY = 'modalhub_user_deployments';

function getLocalDeployments(userId: string): Deployment[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_DEPLOYMENTS_STORAGE_KEY}_${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
    return [];
  } catch (e) {
    console.warn('Error reading local deployments:', e);
    return [];
  }
}

function saveLocalDeployments(userId: string, items: Deployment[]): void {
  try {
    localStorage.setItem(`${LOCAL_DEPLOYMENTS_STORAGE_KEY}_${userId}`, JSON.stringify(items));
  } catch (e) {
    console.warn('Error saving local deployments:', e);
  }
}

export const DeploymentService = {
  /**
   * Fetch all deployments belonging to the authenticated user from Supabase.
   * RLS ensures users can only read their own deployments.
   */
  async getUserDeployments(userId: string, allModels: Model[] = []): Promise<Deployment[]> {
    if (!userId) return [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('deployments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((item: any) => {
            const foundModel =
              allModels.find((m) => m.id === item.model_id) ||
              mockModels.find((m) => m.id === item.model_id);

            const config = typeof item.configuration === 'object' && item.configuration !== null ? item.configuration : {};

            return {
              id: item.id,
              user_id: item.user_id,
              model_id: item.model_id,
              provider: item.provider,
              deployment_type: item.deployment_type,
              status: item.status as DeploymentStatus,
              region: item.region || null,
              instance_type: item.instance_type || null,
              gpu_type: item.gpu_type || null,
              endpoint: item.endpoint || null,
              api_key: item.api_key || null,
              configuration: config,
              created_at: item.created_at || new Date().toISOString(),
              updated_at: item.updated_at || new Date().toISOString(),
              model: foundModel,
              instance_id: item.instance_id || config.instance_id || null,
              public_ip: item.public_ip || config.public_ip || null,
              private_ip: item.private_ip || config.private_ip || null,
              availability_zone: item.availability_zone || config.availability_zone || null
            };
          });
        }

        if (error) {
          console.warn('Supabase deployments query error (table might be initializing):', error.message);
        }
      } catch (err) {
        console.warn('Exception querying Supabase deployments:', err);
      }
    }

    // Fallback to local storage persistence for this user
    const local = getLocalDeployments(userId);
    return local.map((item) => ({
      ...item,
      model: allModels.find((m) => m.id === item.model_id) || mockModels.find((m) => m.id === item.model_id)
    }));
  },

  /**
   * Get a single deployment by ID
   */
  async getDeployment(id: string, userId: string, allModels: Model[] = []): Promise<Deployment | null> {
    if (!id || !userId) return null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('deployments')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          const foundModel =
            allModels.find((m) => m.id === data.model_id) ||
            mockModels.find((m) => m.id === data.model_id);

          const config = typeof data.configuration === 'object' && data.configuration !== null ? data.configuration : {};

          return {
            id: data.id,
            user_id: data.user_id,
            model_id: data.model_id,
            provider: data.provider,
            deployment_type: data.deployment_type,
            status: data.status as DeploymentStatus,
            region: data.region || null,
            instance_type: data.instance_type || null,
            gpu_type: data.gpu_type || null,
            endpoint: data.endpoint || null,
            api_key: data.api_key || null,
            configuration: config,
            created_at: data.created_at,
            updated_at: data.updated_at,
            model: foundModel,
            instance_id: data.instance_id || config.instance_id || null,
            public_ip: data.public_ip || config.public_ip || null,
            private_ip: data.private_ip || config.private_ip || null,
            availability_zone: data.availability_zone || config.availability_zone || null
          };
        }
      } catch (err) {
        console.warn('Exception querying deployment:', err);
      }
    }

    const local = getLocalDeployments(userId);
    const item = local.find((d) => d.id === id);
    if (!item) return null;
    return {
      ...item,
      model: allModels.find((m) => m.id === item.model_id) || mockModels.find((m) => m.id === item.model_id)
    };
  },

  /**
   * Create and provision a real deployment.
   * Enforces MVP configuration boundaries and coordinates with server-side AWS EC2 provisioning.
   */
  async createDeployment(
    draft: DeploymentDraft,
    userId: string,
    allModels: Model[] = []
  ): Promise<{ success: boolean; deployment?: Deployment; error?: string }> {
    if (!userId) {
      return { success: false, error: 'You must be signed in to deploy models.' };
    }

    if (!draft.model_id) {
      return { success: false, error: 'A valid model must be specified for deployment.' };
    }

    // MVP Configuration Boundary Check
    if (draft.provider === 'aws') {
      const region = draft.region || 'us-east-1';
      const instanceType = draft.instance_type || 'g4dn.xlarge';

      if (region !== 'us-east-1' || instanceType !== 'g4dn.xlarge') {
        return {
          success: false,
          error: 'This configuration is not available in the current MVP.'
        };
      }
    }

    const foundModel =
      allModels.find((m) => m.id === draft.model_id) ||
      mockModels.find((m) => m.id === draft.model_id);

    const now = new Date().toISOString();
    const deploymentId = `dep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Verify ownership in library table
    if (isSupabaseConfigured) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const currentAuthUser = authData?.user;

        if (currentAuthUser && currentAuthUser.id === userId) {
          // Check library membership
          const { data: libraryEntry, error: libErr } = await supabase
            .from('library')
            .select('id')
            .eq('user_id', currentAuthUser.id)
            .eq('model_id', draft.model_id)
            .maybeSingle();

          if (libErr) {
            console.warn('Library check warning:', libErr.message);
          }

          if (!libraryEntry) {
            return {
              success: false,
              error: 'You must add this model to your library before deploying it.'
            };
          }

          // Initial record with status = 'deploying'
          const initialConfig = {
            ...(draft.configuration || {}),
            provisioning_started_at: now
          };

          const { data, error } = await supabase
            .from('deployments')
            .insert({
              id: deploymentId,
              user_id: currentAuthUser.id,
              model_id: draft.model_id,
              provider: draft.provider,
              deployment_type: draft.deployment_type,
              status: 'deploying',
              region: draft.region || (draft.provider === 'local' ? 'local' : 'us-east-1'),
              instance_type: draft.instance_type || (draft.provider === 'local' ? 'local-host' : 'g4dn.xlarge'),
              gpu_type: draft.gpu_type || (draft.provider === 'local' ? 'Local GPU/CPU' : 'NVIDIA T4'),
              endpoint: null,
              api_key: null,
              configuration: initialConfig,
              created_at: now,
              updated_at: now
            })
            .select()
            .single();

          if (error) {
            console.error('Supabase deployment insertion error:', error);
            return {
              success: false,
              error: error.message.includes('library')
                ? 'You must add this model to your library before deploying it.'
                : 'Failed to create deployment record in database.'
            };
          }

          let createdRecord = data;

          // If AWS deployment, call server-side EC2 provisioning
          if (draft.provider === 'aws') {
            try {
              const res = await fetch('/api/deployments/provision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  deploymentId: createdRecord.id,
                  modelId: draft.model_id,
                  userId: currentAuthUser.id,
                  provider: 'aws',
                  region: draft.region || 'us-east-1',
                  instanceType: draft.instance_type || 'g4dn.xlarge',
                  gpuType: draft.gpu_type || 'NVIDIA T4',
                  configuration: draft.configuration
                })
              });

              const provResult = await res.json();

              if (res.ok && provResult.success && provResult.status === 'running') {
                // Update record to 'running' with live instance details
                const updatedConfig = {
                  ...initialConfig,
                  instance_id: provResult.instanceId,
                  public_ip: provResult.publicIp,
                  private_ip: provResult.privateIp,
                  availability_zone: provResult.availabilityZone
                };

                const updatePayload: Record<string, any> = {
                  status: 'running',
                  configuration: updatedConfig,
                  updated_at: new Date().toISOString()
                };

                const { data: updatedData } = await supabase
                  .from('deployments')
                  .update(updatePayload)
                  .eq('id', createdRecord.id)
                  .select()
                  .single();

                if (updatedData) {
                  createdRecord = updatedData;
                }

                const finalDeployment: Deployment = {
                  id: createdRecord.id,
                  user_id: createdRecord.user_id,
                  model_id: createdRecord.model_id,
                  provider: createdRecord.provider,
                  deployment_type: createdRecord.deployment_type,
                  status: 'running',
                  region: createdRecord.region,
                  instance_type: createdRecord.instance_type,
                  gpu_type: createdRecord.gpu_type,
                  endpoint: createdRecord.endpoint || null,
                  api_key: createdRecord.api_key || null,
                  configuration: updatedConfig,
                  created_at: createdRecord.created_at,
                  updated_at: new Date().toISOString(),
                  model: foundModel,
                  instance_id: provResult.instanceId,
                  public_ip: provResult.publicIp,
                  private_ip: provResult.privateIp,
                  availability_zone: provResult.availabilityZone
                };

                return { success: true, deployment: finalDeployment };
              } else {
                // Provisioning failed: mark record as failed & save error with safe diagnostics
                const failConfig = {
                  ...initialConfig,
                  instance_id: provResult.instanceId || null,
                  error: provResult.error || provResult.message || 'AWS EC2 instance launch rejected.',
                  error_code: provResult.errorCode,
                  error_name: provResult.errorName,
                  http_status_code: provResult.httpStatusCode,
                  request_id: provResult.requestId,
                  diagnostics: provResult.diagnostics
                };

                await supabase
                  .from('deployments')
                  .update({
                    status: 'failed',
                    configuration: failConfig,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', createdRecord.id);

                return {
                  success: false,
                  error: provResult.message || provResult.error || 'AWS EC2 instance launch rejected.'
                };
              }
            } catch (provErr: any) {
              console.error('[DeploymentService] AWS Provisioning error:', provErr);
              const failConfig = {
                ...initialConfig,
                error: provErr?.message || 'Network or server error communicating with EC2 service.'
              };

              await supabase
                .from('deployments')
                .update({
                  status: 'failed',
                  configuration: failConfig,
                  updated_at: new Date().toISOString()
                })
                .eq('id', createdRecord.id);

              return {
                success: false,
                error: provErr?.message || 'AWS EC2 Provisioning failed.'
              };
            }
          } else {
            // Local deployment
            const newDeployment: Deployment = {
              id: createdRecord.id,
              user_id: createdRecord.user_id,
              model_id: createdRecord.model_id,
              provider: createdRecord.provider,
              deployment_type: createdRecord.deployment_type,
              status: 'running',
              region: createdRecord.region || 'local',
              instance_type: createdRecord.instance_type || 'local-host',
              gpu_type: createdRecord.gpu_type || 'Local GPU/CPU',
              endpoint: `http://localhost:${draft.configuration?.port || 8080}/v1`,
              api_key: 'local_dev_key',
              configuration: createdRecord.configuration || {},
              created_at: createdRecord.created_at,
              updated_at: createdRecord.updated_at,
              model: foundModel
            };

            await supabase
              .from('deployments')
              .update({
                status: 'running',
                endpoint: newDeployment.endpoint,
                api_key: newDeployment.api_key
              })
              .eq('id', createdRecord.id);

            return { success: true, deployment: newDeployment };
          }
        }
      } catch (err: any) {
        console.warn('Supabase createDeployment exception:', err);
      }
    }

    // Local Storage Fallback with Library Check
    try {
      const rawLib = localStorage.getItem(`modalhub_user_library_items_${userId}`);
      const userLib = rawLib ? JSON.parse(rawLib) : [];
      const hasModel = userLib.some((i: any) => i.model_id === draft.model_id);

      if (!hasModel) {
        return {
          success: false,
          error: 'You must add this model to your library before deploying it.'
        };
      }

      // Initial Local Deployment
      let localDep: Deployment = {
        id: deploymentId,
        user_id: userId,
        model_id: draft.model_id,
        provider: draft.provider,
        deployment_type: draft.deployment_type,
        status: 'deploying',
        region: draft.region || (draft.provider === 'local' ? 'local' : 'us-east-1'),
        instance_type: draft.instance_type || (draft.provider === 'local' ? 'local-host' : 'g4dn.xlarge'),
        gpu_type: draft.gpu_type || (draft.provider === 'local' ? 'Local GPU/CPU' : 'NVIDIA T4'),
        endpoint: null,
        api_key: null,
        configuration: draft.configuration || {},
        created_at: now,
        updated_at: now,
        model: foundModel
      };

      const local = getLocalDeployments(userId);
      saveLocalDeployments(userId, [localDep, ...local]);

      if (draft.provider === 'aws') {
        const res = await fetch('/api/deployments/provision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deploymentId: localDep.id,
            modelId: draft.model_id,
            userId,
            provider: 'aws',
            region: draft.region || 'us-east-1',
            instanceType: draft.instance_type || 'g4dn.xlarge',
            gpuType: draft.gpu_type || 'NVIDIA T4',
            configuration: draft.configuration
          })
        });

        const provResult = await res.json();

        if (res.ok && provResult.success && provResult.status === 'running') {
          localDep = {
            ...localDep,
            status: 'running',
            instance_id: provResult.instanceId,
            public_ip: provResult.publicIp,
            private_ip: provResult.privateIp,
            availability_zone: provResult.availabilityZone,
            configuration: {
              ...localDep.configuration,
              instance_id: provResult.instanceId,
              public_ip: provResult.publicIp,
              private_ip: provResult.privateIp,
              availability_zone: provResult.availabilityZone
            },
            updated_at: new Date().toISOString()
          };

          const currentList = getLocalDeployments(userId);
          const updated = currentList.map((d) => (d.id === localDep.id ? localDep : d));
          saveLocalDeployments(userId, updated);

          return { success: true, deployment: localDep };
        } else {
          localDep = {
            ...localDep,
            status: 'failed',
            instance_id: provResult.instanceId || null,
            configuration: {
              ...localDep.configuration,
              instance_id: provResult.instanceId || null,
              error: provResult.error || 'Unable to provision the AWS instance.'
            },
            updated_at: new Date().toISOString()
          };

          const currentList = getLocalDeployments(userId);
          const updated = currentList.map((d) => (d.id === localDep.id ? localDep : d));
          saveLocalDeployments(userId, updated);

          return {
            success: false,
            error: provResult.message || provResult.error || 'Unable to provision the AWS instance.'
          };
        }
      } else {
        localDep.status = 'running';
        localDep.endpoint = `http://localhost:${draft.configuration?.port || 8080}/v1`;
        localDep.api_key = 'local_dev_key';

        const currentList = getLocalDeployments(userId);
        const updated = currentList.map((d) => (d.id === localDep.id ? localDep : d));
        saveLocalDeployments(userId, updated);

        return { success: true, deployment: localDep };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || 'Could not create deployment locally.' };
    }
  },

  /**
   * Update deployment status in Supabase & LocalStorage
   */
  async updateDeploymentStatus(
    id: string,
    userId: string,
    status: DeploymentStatus
  ): Promise<{ success: boolean; error?: string }> {
    if (!id || !userId) return { success: false, error: 'Invalid parameters' };

    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('deployments')
          .update({
            status,
            updated_at: now
          })
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          console.warn('Supabase update deployment status error:', error.message);
        } else {
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Exception updating deployment status:', err);
      }
    }

    // Local fallback
    const local = getLocalDeployments(userId);
    const updated = local.map((d) => (d.id === id ? { ...d, status, updated_at: now } : d));
    saveLocalDeployments(userId, updated);
    return { success: true };
  },

  /**
   * Stop an AWS or Local deployment
   */
  async stopDeployment(
    id: string,
    userId: string,
    allModels: Model[] = []
  ): Promise<{ success: boolean; error?: string }> {
    const deployment = await this.getDeployment(id, userId, allModels);

    if (deployment && deployment.provider === 'aws' && deployment.instance_id) {
      try {
        const res = await fetch('/api/deployments/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instanceId: deployment.instance_id,
            deploymentId: id,
            userId,
            region: deployment.region || 'us-east-1'
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          console.warn('[AWS Stop] Warning stopping instance:', errData);
        }
      } catch (e) {
        console.warn('[AWS Stop] Error communicating with stop endpoint:', e);
      }
    }

    return this.updateDeploymentStatus(id, userId, 'stopped');
  },

  /**
   * Terminate an AWS or Local deployment
   */
  async terminateDeployment(
    id: string,
    userId: string,
    allModels: Model[] = []
  ): Promise<{ success: boolean; error?: string }> {
    const deployment = await this.getDeployment(id, userId, allModels);

    if (deployment && deployment.provider === 'aws' && deployment.instance_id) {
      try {
        const res = await fetch('/api/deployments/terminate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instanceId: deployment.instance_id,
            deploymentId: id,
            userId,
            region: deployment.region || 'us-east-1'
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          console.warn('[AWS Terminate] Warning terminating instance:', errData);
        }
      } catch (e) {
        console.warn('[AWS Terminate] Error communicating with terminate endpoint:', e);
      }
    }

    return this.updateDeploymentStatus(id, userId, 'terminated');
  },

  /**
   * Delete deployment record permanently
   */
  async deleteDeployment(id: string, userId: string): Promise<{ success: boolean; error?: string }> {
    if (!id || !userId) return { success: false, error: 'Invalid parameters' };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('deployments')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          console.warn('Supabase delete deployment error:', error.message);
        } else {
          return { success: true };
        }
      } catch (err) {
        console.warn('Exception deleting deployment:', err);
      }
    }

    const local = getLocalDeployments(userId);
    const filtered = local.filter((d) => d.id !== id);
    saveLocalDeployments(userId, filtered);
    return { success: true };
  }
};

