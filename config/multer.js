const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

const s3 = new aws.S3({
  accessKeyId: process.env.accesKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: 'ap-northeast-2'
});

const upload = (path) => multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.bucketName + path,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now() + '_' + file.originalname.split('.')[0] + '.' + file.originalname.split('.').pop())
    }
  })
})

const storyUpload = upload('/with/story');
const ABTestUpload = upload('/with/abTest');
const craftCommentUpload = upload('/with/craft/comment');
const userProfileUpload = upload('/users');

module.exports = {
  storyUpload,
  ABTestUpload,
  craftCommentUpload,
  userProfileUpload,
}