const { Post, User, Comment } = require("../models/");
require("dotenv").config();
const MAIN_URL = process.env.MAIN_URL;

const PostController = {
    async create(req, res, next) {
        try {
            const image = req.file ?
                `${MAIN_URL}/imgs/${req.file.filename}` :
                undefined;
            const newPost = {
                title: req.body.title,
                body: req.body.body,
                author: req.user._id,
                image,
            };
            const post = await Post.create(newPost);
            await User.findByIdAndUpdate(
                req.user._id,
                { $push: { posts: post._id } }
            );
            return res.status(201).send({ msg: "Post created", post });
        } catch (error) {
            error.origin = 'post';
            error.suborigin = 'create';
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const post = await Post.findById(req.params._id)
                .populate('author', { username: 1, avatar: 1, role: 1 })
                .populate({ path: 'comments', populate: { path: 'author', select: { username: 1, avatar: 1, role: 1 } } });
            return res.send({ msg: "Post", post });
        } catch (error) {
            error.origin = 'post';
            error.suborigin = 'getById';
            next(error);
        }
    },
    async searchByTitle(req, res, next) {
        try {
            let { page = 1, limit = 10, title } = req.query;
            if (title === undefined) {
                return res.status(400).send({ msg: 'name is required' });
            }
            if (title.length > 30) {
                return res.status(400).send({ msg: "Search string too long" });
            }
            // Pagination
            if (isNaN(limit)) { limit = 10; }
            limit = Math.max(1, Math.min(limit, 20));
            const titleRgx = new RegExp(title, 'i');
            const total = await Post.count({ titleRgx });
            const maxPages = Math.ceil(total / limit);
            // Current page
            if (isNaN(page)) { page = 1; }
            page = Math.max(1, Math.min(page, maxPages));
            const posts = await Post.find({ titleRgx })
                .sort('-updatedAt')
                .limit(limit)
                .skip(limit * (page - 1))
                .populate('author', { username: 1, avatar: 1, role: 1 });
            return res.send({ msg: "Posts found", total, page, maxPages, posts });
        } catch (error) {
            error.origin = 'post';
            error.suborigin = 'getByTitle';
            next(error);
        }
    },
    async getAll(req, res, next) {
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
                .sort('-updatedAt')
                .limit(limit)
                .skip(limit * (page - 1))
                .populate('author', { username: 1, avatar: 1, role: 1 })
                .populate({
                    path: 'comments',
                    populate: { path: 'author', select: { username: 1, avatar: 1, role: 1 } }
                });
            return res.send({ msg: "All posts", total, page, maxPages, posts });
        } catch (error) {
            error.origin = 'post';
            error.suborigin = 'getAll';
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const image = req.file ?
                `${MAIN_URL}/imgs/${req.file.filename}` :
                undefined;
            const updatedPost = {
                title: req.body.title,
                body: req.body.body,
                image,
            };
            const post = await Post.findOneAndUpdate(
                { _id: req.params._id, author: req.user._id },
                updatedPost,
                { new: true }
            );
            return res.send({ msg: "Post updated", post });
        } catch (error) {
            error.origin = 'post';
            error.suborigin = 'update';
            next(error);
        }
    },
    async delete(req, res, next) {
        try {
            // Delete post
            const post = await Post.findOneAndDelete(
                { _id: req.params._id, author: req.user._id }
            );
            if (post) {
                // Post existed: Cleaning
                // Delete reference to post from author
                await User.findByIdAndUpdate(
                    req.user_id,
                    { $pull: { comments: post._id } }
                );
                // Delete references of likes from users
                post.likes.forEach(async (userId) => {
                    await User.findByIdAndUpdate(userId,
                        { $pull: { likedPosts: post._id } });
                });
                // Delete all comments of this post (and clean)
                post.comments.forEach(async (commentId) => {
                    // Delete comment
                    const comment = await Comment.findByIdAndDelete(commentId);
                    if (comment) {
                        // Comment existed: Cleaning
                        // Delete reference to this comment from Post
                        await Post.findByIdAndUpdate(comment.postId,
                            { $pull: { comments: commentId } }
                        );
                        // Delete reference to this comment from author
                        await User.findByIdAndUpdate(comment.author,
                            { $pull: { comments: commentId } }
                        );
                        // Delete references to this comments from 'likes'
                        //  (users who liked this comment)
                        comment.likes.forEach(async (userId) => {
                            await User.findByIdAndUpdate(userId,
                                { $pull: { likedComments: commentId } });
                        });
                    }
                });
                // // TODO: Delete all comments of the deleted post AND the references to these coments in their authors
                return res.send({ msg: "Post deleted", post });
            } else {
                return res.send({ msg: "Can't delete post" });
            }
        } catch (error) {
            error.origin = 'post';
            error.suborigin = 'delete';
            next(error);
        }
    },
    async like(req, res, next) {
        try {
            const post = await Post.findOneAndUpdate(
                { _id: req.params._id, likes: { $nin: req.user._id } },
                { $push: { likes: req.user._id } },
                { new: true }
            );
            if (post) {
                await User.findByIdAndUpdate(
                    req.user._id,
                    { $push: { likedPosts: post._id } }
                );
                return res.send({ msg: "Post liked", post });
            } else {
                return res.status(400).send({ msg: 'Error liking post' });
            }
        } catch (error) {
            error.origin = 'post';
            error.suborigin = 'like';
            next(error);
        }
    },
    async unlike(req, res, next) {
        try {
            const post = await Post.findByIdAndUpdate(
                req.params._id,
                { $pull: { likes: req.user._id } }
            );
            if (post) {
                await User.findByIdAndUpdate(
                    req.user._id,
                    { $pull: { likedPosts: post._id } }
                );
                return res.send({ msg: "Post unliked" });
            } else {
                return res.send({ msg: "Error unliking post" });
            }
        } catch (error) {
            error.origin = 'post';
            error.suborigin = 'unlike';
            next(error);
        }
    }
};

module.exports = PostController;