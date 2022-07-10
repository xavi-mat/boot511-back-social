'use strict';
const express =require("express");
const AdminController = require("../controllers/AdminController");
const {authentication, isAdmin} = require("../middleware/authentication");
const router = express.Router();

router.get('/users', authentication, isAdmin, AdminController.getUsers);
router.put('/user/activate/:_id', authentication, isAdmin, AdminController.activateUser);
router.put('/user/deactivate/:_id', authentication, isAdmin, AdminController.deactivateUser);
router.get('/posts', authentication, isAdmin, AdminController.getPosts);
router.put('/post/activate/:_id', authentication, isAdmin, AdminController.activatePost);
router.put('/post/deactivate/:_id', authentication, isAdmin, AdminController.deactivatePost);
router.get('/comments', authentication, isAdmin, AdminController.getComments);
router.put('/comment/activate/:_id', authentication, isAdmin, AdminController.activateComment);
router.put('/comment/deactivate/:_id', authentication, isAdmin, AdminController.deactivateComment);

module.exports = router;