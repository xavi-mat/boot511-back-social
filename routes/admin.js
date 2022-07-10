'use strict';
const express =require("express");
const AdminController = require("../controllers/AdminController");
const {authentication, isAdmin} = require("../middleware/authentication");
const router = express.Router();

router.get('/posts', authentication, isAdmin, AdminController.getPosts);
router.put('/post/activate/:_id', authentication, isAdmin, AdminController.activatePost);
router.put('/post/deactivate/:_id', authentication, isAdmin, AdminController.deactivatePost);

module.exports = router;