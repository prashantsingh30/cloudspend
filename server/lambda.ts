import serverlessExpress from '@vendia/serverless-express';
import app from './app';

// Export AWS Lambda handler for Lambda Function URL
export const handler = serverlessExpress({ app });
