import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStorage logic

const logger = createLogger('S3Service')


export const bucket = process.env.S3_BUCKET;
export const expiration_time = process.env.S3_SINGNED_URL_EXPIRATION_TIME ?? 3600;


export class AttachmentUtils {
    async generateUploadUrl (key: string) {
        const s3 = new XAWS.S3({
            signatureVersion: 'v4'
        });
    
        try {
            return s3.getSignedUrl('putObject', {
                Bucket: bucket,
                Key: key,
                Expires: expiration_time
            })
        
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }
}
