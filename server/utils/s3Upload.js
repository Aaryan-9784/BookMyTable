/**
 * S3 upload helper — puts object with public-read ACL when bucket policy allows public objects.
 * If your bucket uses bucket policy only (no ACL), remove ACL and rely on policy.
 */
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/awsClients.js';

const bucket = process.env.S3_BUCKET_NAME;
const region = process.env.AWS_REGION || 'us-east-1';

/**
 * @param {Buffer} buffer File bytes
 * @param {string} key S3 object key (e.g. restaurants/uuid.jpg)
 * @param {string} contentType MIME type
 * @returns {Promise<string>} Public URL of the object
 */
export async function uploadBufferToS3(buffer, key, contentType) {
  if (!bucket) {
    throw new Error('S3_BUCKET_NAME is not configured');
  }

  // Object ACLs are often disabled (Bucket owner enforced). Use a bucket policy for public GetObject on this prefix.
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const safeKey = key.split('/').map(encodeURIComponent).join('/');
  return `https://${bucket}.s3.${region}.amazonaws.com/${safeKey}`;
}
