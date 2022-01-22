const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

const s3 = new aws.S3({
  accessKeyId: process.env.accesKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: 'ap-northeast-2'
});

const storyUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.bucketName + '/with/story',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now() + '_' + file.originalname.split('.')[0] + '.' + file.originalname.split('.').pop())
    }
  })
})

const ABTestUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.bucketName + '/with/abTest',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now() + '_' + file.originalname.split('.')[0] + '.' + file.originalname.split('.').pop())
    }
  })
})

const craftCommentUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.bucketName + '/with/craft/comment',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now() + '_' + file.originalname.split('.')[0] + '.' + file.originalname.split('.').pop())
    }
  })
})

const userProfileUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.bucketName + '/users',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now() + '_' + file.originalname.split('.')[0] + '.' + file.originalname.split('.').pop())
    }
  })
})

module.exports = {
  storyUpload,
  ABTestUpload,
  craftCommentUpload,
  userProfileUpload,
}