const S3 = require( 'aws-sdk/clients/s3'),
  // AWS = require('aws-sdk'),
  cfg = require('./common').config;

const s3Client = new S3({
  accessKeyId: cfg.s3.AWS_ACCESS_KEY,
  secretAccessKey: cfg.s3.AWS_SECRET_ACCESS_KEY,
  region: cfg.s3.REGION
});

const downloadParams = {
  Bucket: cfg.s3.Bucket,
  Key: '', // pass key
};

const uploadParams = {
  Bucket: cfg.s3.Bucket, 
  Key: '', // pass key
  Body: null, // pass file body
};

const headParams = {
  Bucket: cfg.s3.Bucket,
  Key: '', // pass key
};

const s3 = {};
s3.s3Client = s3Client;
s3.downloadParams = downloadParams;
s3.uploadParams = uploadParams;
s3.headParams = headParams;

module.exports = s3;