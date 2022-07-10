const { User, Post, Comment } = require("../models/");
require("dotenv").config();

const AdminController = {
  async getUsers(req, res, next) {
    try {
      // Pagination
      let { page = 1, limit = 10 } = req.query;
      // Limit per page:
      if (isNaN(limit)) { limit = 10; }
      limit = Math.max(1, Math.min(limit, 20));
      const total = await User.count();
      const maxPages = Math.ceil(total / limit);
      // Current page
      if (isNaN(page)) { page = 1; }
      page = Math.max(1, Math.min(page, maxPages));
      const users = await User.find()
        .sort('-createdAt')
        .limit(limit)
        .skip(limit * (page - 1))
      return res.send({ msg: "All users", total, page, maxPages, users });
    } catch (error) {
      error.origin = 'admin';
      error.suborigin = 'getUsers';
      next(error);
    }
  },
  async activateUser(req, res, next) {
    try {
      const user = await User.findByIdAndUpdate(req.params._id, { active: true });
      if (user) {
        res.send({msg: "User activated", _id: user._id})
      } else {
        res.status(404).send({msg: "User not found"})
      }
    } catch (error) {
      error.origin = 'admin';
      error.suborigin = 'activateUser';
      next(error);
    }
  },
  async deactivateUser(req, res, next) {
    try {
      const user = await User.findByIdAndUpdate(req.params._id, { active: false });
      if (user) {
        res.send({msg: "User deactivated", _id: user._id})
      } else {
        res.status(404).send({msg: "User not found"})
      }
    } catch (error) {
      error.origin = 'admin';
      error.suborigin = 'deactivateUser';
      next(error);
    }
  },
  async getPosts(req, res, next) {
    try {
      // Pagination
      let { page = 1, limit = 10 } = req.query;
      // Limit per page:
      if (isNaN(limit)) { limit = 10; }
      limit = Math.max(1, Math.min(limit, 20));
      const total = await Post.count();
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
  async getComments(req, res, next) {
    try {
      // Pagination
      let { page = 1, limit = 10 } = req.query;
      // Limit per page:
      if (isNaN(limit)) { limit = 10; }
      limit = Math.max(1, Math.min(limit, 20));
      const total = await Comment.count();
      const maxPages = Math.ceil(total / limit);
      // Current page
      if (isNaN(page)) { page = 1; }
      page = Math.max(1, Math.min(page, maxPages));
      const comments = await Comment.find()
        .sort('-createdAt')
        .limit(limit)
        .skip(limit * (page - 1))
        .populate('author')
        return res.send({ msg: "All comments", total, page, maxPages, comments });
    } catch (error) {
      error.origin = 'admin';
      error.suborigin = 'getComments';
      next(error);
    }
  },
  async activateComment(req, res, next) {
    try {
      const comment = await Comment.findByIdAndUpdate(req.params._id, { active: true });
      if (comment) {
        res.send({msg: "Comment activated", _id: comment._id})
      } else {
        res.status(404).send({msg: "Comment not found"})
      }
    } catch (error) {
      error.origin = 'admin';
      error.suborigin = 'activateComment';
      next(error);
    }
  },
  async deactivateComment(req, res, next) {
    try {
      const comment = await Comment.findByIdAndUpdate(req.params._id, { active: false });
      if (comment) {
        res.send({msg: "Comment deactivated", _id: comment._id})
      } else {
        res.status(404).send({msg: "Comment not found"})
      }
    } catch (error) {
      error.origin = 'admin';
      error.suborigin = 'deactivateComment';
      next(error);
    }
  },
};

module.exports = AdminController;