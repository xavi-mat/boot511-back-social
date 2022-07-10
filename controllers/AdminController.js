const { Post } = require("../models/");
require("dotenv").config();
const MAIN_URL = process.env.MAIN_URL;

const AdminController = {
  async getPosts(req, res, next) {
    try {
      // Pagination
      let { page = 1, limit = 10 } = req.query;
      // Limit per page:
      if (isNaN(limit)) { limit = 10; }
      limit = Math.max(1, Math.min(limit, 20));
      const total = await Post.count({ active: true });
      const maxPages = Math.ceil(total / limit);
      // Current page
      if (isNaN(page)) { page = 1; }
      page = Math.max(1, Math.min(page, maxPages));
      const posts = await Post.find()
        .sort('-createdAt')
        .limit(limit)
        .skip(limit * (page - 1))
        .populate('author')
      return res.send({ msg: "All posts", total, page, maxPages, posts });
    } catch (error) {
      error.origin = 'admin';
      error.suborigin = 'getPosts';
      next(error);
    }
  },
  async activatePost(req, res, next) {
    try {
      const post = await Post.findByIdAndUpdate(req.params._id, { active: true });
      if (post) {
        res.send({msg: "Post activated", _id: post._id})
      } else {
        res.status(404).send({msg: "Post not found"})
      }
    } catch (error) {
      error.origin = 'admin';
      error.suborigin = 'activatePost';
      next(error);
    }
  },
  async deactivatePost(req, res, next) {
    try {
      const post = await Post.findByIdAndUpdate(req.params._id, { active: false });
      if (post) {
        res.send({msg: "Post deactivated", _id: post._id})
      } else {
        res.status(404).send({msg: "Post not found"})
      }
    } catch (error) {
      error.origin = 'admin';
      error.suborigin = 'deactivatePost';
      next(error);
    }
  },
};

module.exports = AdminController;