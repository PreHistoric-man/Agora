import express from 'express';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { verifyAwsRoleServer } from './src/services/serverAwsVerifier';
import {
  provisionAwsEc2Instance,
  stopAwsEc2Instance,
  terminateAwsEc2Instance
} from './src/services/serverAwsEc2Service';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request body parser
  app.use(express.json());

  // API Routes FIRST
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'modalhub-backend',
      timestamp: new Date().toISOString()
    });
  });

  // Server-side AWS Cross-Account Role verification endpoint
  app.post('/api/aws/verify', async (req, res) => {
    try {
      const { roleArn, region, externalId, accountId, userId } = req.body || {};

      const targetRoleArn =
        roleArn && typeof roleArn === 'string' && roleArn.trim()
          ? roleArn.trim()
          : 'arn:aws:iam::625552167334:role/ModalHubDeploymentRole';

      const targetRegion =
        region && typeof region === 'string' && region.trim()
          ? region.trim()
          : process.env.AWS_REGION || 'us-east-1';

      const targetAccountId =
        accountId && typeof accountId === 'string' && accountId.trim()
          ? accountId.trim()
          : process.env.MODALHUB_AWS_ACCOUNT_ID || '625552167334';

      const result = await verifyAwsRoleServer({
        roleArn: targetRoleArn,
        region: targetRegion,
        externalId,
        accountId: targetAccountId,
        userId
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (err: any) {
      console.error('[API /api/aws/verify Error]:', err?.name || 'Error');
      return res.status(500).json({
        success: false,
        status: 'failed',
        connected: false,
        errorCode: err?.name || 'InternalServerError',
        error: 'Unable to assume the ModalHub deployment role.',
        message: err?.message || 'Server error occurred during AWS STS verification.'
      });
    }
  });

  // Phase 2B: Real AWS EC2 Provisioning endpoint
  app.post('/api/deployments/provision', async (req, res) => {
    try {
      const {
        deploymentId,
        modelId,
        userId,
        provider,
        region,
        instanceType,
        gpuType,
        roleArn,
        configuration
      } = req.body || {};

      if (!deploymentId || !modelId || !userId) {
        return res.status(400).json({
          success: false,
          status: 'failed',
          error: 'deploymentId, modelId, and userId are required.'
        });
      }

      // Check MVP supported configuration: region us-east-1 & instanceType g4dn.xlarge
      if (
        (region && region !== 'us-east-1') ||
        (instanceType && instanceType !== 'g4dn.xlarge')
      ) {
        return res.status(400).json({
          success: false,
          status: 'failed',
          errorCode: 'UNSUPPORTED_CONFIGURATION',
          error: 'This configuration is not available in the current MVP.',
          message: 'This configuration is not available in the current MVP.'
        });
      }

      const result = await provisionAwsEc2Instance({
        deploymentId,
        modelId,
        userId,
        provider: provider || 'aws',
        region: region || 'us-east-1',
        instanceType: instanceType || 'g4dn.xlarge',
        gpuType: gpuType || 'NVIDIA T4',
        roleArn: roleArn || 'arn:aws:iam::625552167334:role/ModalHubDeploymentRole',
        configuration
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (err: any) {
      console.error('[API /api/deployments/provision Error]:', err);
      return res.status(500).json({
        success: false,
        status: 'failed',
        errorCode: err?.Code || err?.name || 'InternalServerError',
        error: err?.message || 'Server error occurred during EC2 provisioning.',
        message: err?.message || 'Server error occurred during EC2 provisioning.'
      });
    }
  });

  // Phase 2B: Stop EC2 Instance endpoint
  app.post('/api/deployments/stop', async (req, res) => {
    try {
      const { instanceId, deploymentId, userId, roleArn, region } = req.body || {};

      if (!instanceId) {
        return res.status(400).json({
          success: false,
          error: 'instanceId is required to stop an AWS deployment.'
        });
      }

      const result = await stopAwsEc2Instance({
        instanceId,
        deploymentId,
        userId: userId || 'anonymous',
        roleArn: roleArn || 'arn:aws:iam::625552167334:role/ModalHubDeploymentRole',
        region: region || 'us-east-1'
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (err: any) {
      console.error('[API /api/deployments/stop Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to stop AWS EC2 instance.',
        message: err?.message
      });
    }
  });

  // Phase 2B: Terminate EC2 Instance endpoint
  app.post('/api/deployments/terminate', async (req, res) => {
    try {
      const { instanceId, deploymentId, userId, roleArn, region } = req.body || {};

      if (!instanceId) {
        return res.status(400).json({
          success: false,
          error: 'instanceId is required to terminate an AWS deployment.'
        });
      }

      const result = await terminateAwsEc2Instance({
        instanceId,
        deploymentId,
        userId: userId || 'anonymous',
        roleArn: roleArn || 'arn:aws:iam::625552167334:role/ModalHubDeploymentRole',
        region: region || 'us-east-1'
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (err: any) {
      console.error('[API /api/deployments/terminate Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to terminate AWS EC2 instance.',
        message: err?.message
      });
    }
  });

  // Vite middleware in development vs static SPA serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ModalHub server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
