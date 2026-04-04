/**
 * Centralized AWS SDK v3 clients (S3, SES) using default credential chain + region.
 * Credentials: env AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY or IAM role on EC2/ECS/Lambda.
 */
import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';

const region = process.env.AWS_REGION || 'us-east-1';

export const s3Client = new S3Client({ region });

export const sesClient = new SESClient({
  region: process.env.SES_REGION || region,
});
