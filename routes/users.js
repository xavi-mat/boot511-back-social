'use strict';
const express = require("express");
const UserController = require("../controllers/UserController");
const { authentication, isAdmin } = require("../middleware/authentication");
const router = express.Router();
const { uploadAvatar } = require("../middleware/multer");

router.post('/', UserController.register);
router.post('/login', UserController.login);
router.get('/', authentication, UserController.getData);
router.get('/confirm/:emailToken', UserController.confirmEmail);
router.get('/search', UserController.searchByUsername);
router.get('/id/:_id', UserController.getById);
router.put('/', authentication, uploadAvatar.single('avatar'), UserController.update);
router.put('/follow/:_id', authentication, UserController.follow);
router.delete('/delete', authentication, UserController.delete);
router.delete('/logout', authentication, UserController.logout);
router.delete('/follow/:_id', authentication, UserController.unfollow);

router.delete('/clean-all', authentication, isAdmin, UserController.cleanAll);

module.exports = router;