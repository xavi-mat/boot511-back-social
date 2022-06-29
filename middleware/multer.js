'use strict';
// Multer funcionality, adapted from https://stackoverflow.com/a/39650303
const multer = require('multer');
const path = require('path');

const storageAvatar = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/avatars/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
});
const uploadAvatar = multer({ storage: storageAvatar });

const storageImg = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/imgs/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
});
const uploadImg = multer({ storage: storageImg });

module.exports = { uploadAvatar, uploadImg };
