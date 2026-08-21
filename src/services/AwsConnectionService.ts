import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { AwsConnection, VerifyAwsRoleResponse } from '../types/aws';
import { verifyAwsRoleServer } from './serverAwsVerifier';

const AWS_CONNECTION_LOCAL_KEY = 'modalhub_aws_connections';

class AwsConnectionService {
  /**
   * Fetch current active AWS connection for the authenticated user.
   */
  async getUserAwsConnection(userId: string): Promise<AwsConnection | null> {
    if (!userId) return null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('aws_connections')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.warn('[AwsConnectionService] Supabase query error, fallback to local storage:', error.message);
          return this.getLocalConnection(userId);
        }

        if (data) {
          // Sync with local storage
          this.saveLocalConnection(data as AwsConnection);
          return data as AwsConnection;
        }

        return this.getLocalConnection(userId);
      } catch (err) {
        console.warn('[AwsConnectionService] Error querying Supabase:', err);
        return this.getLocalConnection(userId);
      }
    }

    return this.getLocalConnection(userId);
  }

  /**
   * Verify an AWS IAM Role via server-side verification endpoint
   * and save the resulting connection to Supabase / local storage.
   */
  async verifyAndConnectAws(params: {
    userId: string;
    roleArn: string;
    accountId?: string;
    region: string;
    externalId?: string;
  }): Promise<VerifyAwsRoleResponse> {
    const { userId, roleArn, accountId, region, externalId } = params;

    if (!userId) {
      return {
        success: false,
        status: 'failed',
        error: 'User must be authenticated to connect an AWS account.'
      };
    }

    let verificationResult: VerifyAwsRoleResponse;

    const effectiveRoleArn =
      (roleArn && roleArn.trim()) || 'arn:aws:iam::625552167334:role/ModalHubDeploymentRole';
    const effectiveRegion = (region && region.trim()) || 'us-east-1';
    const effectiveAccountId =
      (accountId && accountId.trim()) || '625552167334';

    // 1. Call server-side verification endpoint (/api/aws/verify)
    try {
      const response = await fetch('/api/aws/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          roleArn: effectiveRoleArn,
          accountId: effectiveAccountId,
          region: effectiveRegion,
          externalId
        })
      });

      if (response.ok) {
        verificationResult = await response.json();
      } else {
        const errorBody = await response.json().catch(() => ({}));
        verificationResult = {
          success: false,
          status: 'failed',
          connected: false,
          errorCode: errorBody.errorCode,
          message: errorBody.message,
          error:
            errorBody.message ||
            errorBody.error ||
            'Unable to assume the ModalHub deployment role.'
        };
      }
    } catch (fetchErr) {
      console.warn('[AwsConnectionService] Direct API call fallback:', fetchErr);
      verificationResult = await verifyAwsRoleServer({
        userId,
        roleArn: effectiveRoleArn,
        accountId: effectiveAccountId,
        region: effectiveRegion,
        externalId
      });
    }

    if (!verificationResult.success || verificationResult.status !== 'connected') {
      // Save failed connection attempt for record
      await this.saveConnectionRecord({
        user_id: userId,
        account_id: verificationResult.accountId || effectiveAccountId,
        role_arn: effectiveRoleArn,
        region: effectiveRegion,
        status: 'failed',
        external_id: externalId || null,
        error_message: verificationResult.error || 'Unable to assume the ModalHub deployment role.',
        verified_at: null
      });

      return verificationResult;
    }

    // 2. Save successfully connected record to Supabase
    const verifiedAccountId = verificationResult.accountId || effectiveAccountId;
    const connectionRecord: Partial<AwsConnection> = {
      user_id: userId,
      account_id: verifiedAccountId,
      role_arn: effectiveRoleArn,
      region: effectiveRegion,
      status: 'connected',
      external_id: externalId || null,
      error_message: null,
      verified_at: verificationResult.verifiedAt || new Date().toISOString()
    };

    const saved = await this.saveConnectionRecord(connectionRecord);

    return {
      ...verificationResult,
      connectionId: saved?.id
    };
  }

  /**
   * Save or update an AWS connection record in Supabase and local storage.
   */
  private async saveConnectionRecord(
    record: Partial<AwsConnection> & { user_id: string; account_id: string; role_arn: string; status: any }
  ): Promise<AwsConnection | null> {
    const payload = {
      ...record,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        // Upsert by user_id and account_id
        const { data, error } = await supabase
          .from('aws_connections')
          .upsert(payload, { onConflict: 'user_id,account_id' })
          .select()
          .single();

        if (!error && data) {
          this.saveLocalConnection(data as AwsConnection);
          return data as AwsConnection;
        } else if (error) {
          console.warn('[AwsConnectionService] Supabase upsert error:', error.message);
        }
      } catch (err) {
        console.warn('[AwsConnectionService] Exception during Supabase upsert:', err);
      }
    }

    // Local fallback
    const fallbackId = `aws-conn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullRecord: AwsConnection = {
      id: fallbackId,
      user_id: record.user_id,
      account_id: record.account_id,
      role_arn: record.role_arn,
      region: record.region || 'us-east-1',
      status: record.status,
      external_id: record.external_id || null,
      error_message: record.error_message || null,
      verified_at: record.verified_at || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.saveLocalConnection(fullRecord);
    return fullRecord;
  }

  /**
   * Disconnect an AWS connection.
   */
  async disconnectAws(connectionId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    if (!userId) return { success: false, error: 'User not authenticated' };

    if (isSupabaseConfigured && connectionId && !connectionId.startsWith('aws-conn-')) {
      try {
        const { error } = await supabase
          .from('aws_connections')
          .update({
            status: 'disconnected',
            updated_at: new Date().toISOString()
          })
          .eq('id', connectionId)
          .eq('user_id', userId);

        if (error) {
          console.warn('[AwsConnectionService] Supabase disconnect error:', error.message);
        }
      } catch (err: any) {
        console.warn('[AwsConnectionService] Exception during disconnect:', err);
      }
    }

    // Update local state
    this.removeLocalConnection(userId);
    return { success: true };
  }

  /**
   * Delete an AWS connection record.
   */
  async deleteAwsConnection(connectionId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    if (!userId) return { success: false, error: 'User not authenticated' };

    if (isSupabaseConfigured && connectionId && !connectionId.startsWith('aws-conn-')) {
      try {
        const { error } = await supabase
          .from('aws_connections')
          .delete()
          .eq('id', connectionId)
          .eq('user_id', userId);

        if (error) {
          console.warn('[AwsConnectionService] Supabase delete error:', error.message);
        }
      } catch (err: any) {
        console.warn('[AwsConnectionService] Exception during delete:', err);
      }
    }

    this.removeLocalConnection(userId);
    return { success: true };
  }

  // --- Local Storage Helpers ---
  private getLocalConnection(userId: string): AwsConnection | null {
    try {
      const raw = localStorage.getItem(AWS_CONNECTION_LOCAL_KEY);
      if (!raw) return null;
      const list: AwsConnection[] = JSON.parse(raw);
      const conn = list.find((c) => c.user_id === userId);
      return conn || null;
    } catch {
      return null;
    }
  }

  private saveLocalConnection(conn: AwsConnection): void {
    try {
      const raw = localStorage.getItem(AWS_CONNECTION_LOCAL_KEY);
      const list: AwsConnection[] = raw ? JSON.parse(raw) : [];
      const index = list.findIndex((c) => c.user_id === conn.user_id && c.account_id === conn.account_id);
      if (index >= 0) {
        list[index] = conn;
      } else {
        list.push(conn);
      }
      localStorage.setItem(AWS_CONNECTION_LOCAL_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  private removeLocalConnection(userId: string): void {
    try {
      const raw = localStorage.getItem(AWS_CONNECTION_LOCAL_KEY);
      if (!raw) return;
      const list: AwsConnection[] = JSON.parse(raw);
      const filtered = list.filter((c) => c.user_id !== userId);
      localStorage.setItem(AWS_CONNECTION_LOCAL_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  }
}

export const awsConnectionService = new AwsConnectionService();
