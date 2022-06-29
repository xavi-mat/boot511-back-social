'use strict';
const express = require("express");
const CommentController = require("../controllers/CommentController");
const { authentication, isCommentAuthor } = require("../middleware/authentication");
const router = express.Router();
const { uploadImg } = require("../middleware/multer");

router.post('/', authentication, uploadImg.single('image'), CommentController.create);
router.get('/id/:_id', CommentController.getById);
router.put('/id/:_id', authentication, isCommentAuthor, uploadImg.single('image'),
    CommentController.update);
router.put('/like/:_id', authentication, CommentController.like);
router.delete('/id/:_id', authentication, isCommentAuthor, CommentController.delete);
router.delete('/like/:_id', authentication, CommentController.unlike);

module.exports = router;