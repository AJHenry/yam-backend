const aws = require('aws-sdk');
const stream = require('stream');

const { S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION, S3_BUCKET_NAME } = process.env;

console.log(`
AWS Credentials
S3_ACCESS_KEY: ${S3_ACCESS_KEY}
S3_SECRET_KEY: ${S3_SECRET_KEY}
S3_REGION: ${S3_REGION}
`);

aws.config.update({
  // Your SECRET ACCESS KEY from AWS should go here,
  // Never share it!
  // Setup Env Variable, e.g: process.env.SECRET_ACCESS_KEY
  secretAccessKey: S3_SECRET_KEY,
  // Not working key, Your ACCESS KEY ID from AWS should go here,
  // Never share it!
  // Setup Env Variable, e.g: process.env.ACCESS_KEY_ID
  accessKeyId: S3_ACCESS_KEY,
  region: S3_REGION, // region of your bucket
});

const s3 = new aws.S3();

export const uploadStream = ({ Key }) => {
  console.log('s3Upload: uploadStream');
  const pass = new stream.PassThrough();
  return {
    writeStream: pass,
    promise: s3.upload({ Bucket: S3_BUCKET_NAME, Key, Body: pass }).promise(),
  };
};
