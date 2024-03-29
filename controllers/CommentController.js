const { Comment, Post, User } = require("../models/");
require("dotenv").config();
const MAIN_URL = process.env.MAIN_URL;

const CommentController = {
    async create(req, res, next) {
        try {
            if (!req.user.active) {
                return res.status(400).send({ msg: "Muted user. Can't comment" });
            }
            const image = req.file ?
                `${MAIN_URL}/imgs/${req.file.filename}` :
                undefined;
            const postExistsAndIsActive = await Post.count(
                { _id: req.body.postId, active: true }
            );
            if (!postExistsAndIsActive) {
                return res.status(400).send({ msg: "Post not found" });
            }
            const newComment = {
                postId: req.body.postId,
                text: req.body.text,
                author: req.user._id,
                image,
            };
            let comment = await Comment.create(newComment)
            comment = await comment.populate(
                'author',
                { username: 1, avatar: 1, role: 1 }
            );
            const post = await Post.findByIdAndUpdate(
                req.body.postId,
                { $push: { comments: comment._id } },
                { new: true }
            );
            if (!post) {
                await Comment.findByIdAndDelete(comment._id);
                return res.status(400).send({ msg: "Post does not exist" });
            }
            await User.findByIdAndUpdate(
                req.user._id,
                { $push: { comments: comment._id } }
            );
            return res.status(201).send({ msg: "Comment created", comment });
        } catch (error) {
            error.origin = 'comment';
            error.suborigin = 'create';
            next(error);
        }
    },
    async delete(req, res, next) {
        try {
            const comment = await Comment.findOneAndDelete(
                { _id: req.params._id, author: req.user._id }
            );
            if (comment) {
                // Comment existed: Cleaning
                // Delete reference to this comment from Post
                await Post.findByIdAndUpdate(comment.postId,
                    { $pull: { comments: comment._id } }
                );
                // Delete reference to this comment from author
                await User.findByIdAndUpdate(comment.author,
                    { $pull: { comments: comment._id } }
                );
                // Delete references to this comments from 'likes'
                //  (users who liked this comment)
                comment.likes.forEach(async (userId) => {
                    await User.findByIdAndUpdate(userId,
                        { $pull: { likedComments: comment._id } });
                });
                return res.send({ msg: "Comment deleted", comment });
            } else {
                return res.status(404).send({ msg: "Error deleting comment" });
            }
        } catch (error) {
            error.origin = 'comment';
            error.suborigin = 'delete';
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const image = req.file ?
                `${MAIN_URL}/imgs/${req.file.filename}` :
                undefined;
            const updatedComment = {
                text: req.body.text,
                image,
            };
            const comment = await Comment.findByIdAndUpdate(
                req.params._id,
                updatedComment,
                { new: true, runValidators: true }
            )
                .populate('author', { username: 1, avatar: 1, role: 1 })
            if (comment) {
                return res.send({ msg: "Comment updated", comment });
            } else {
                return res.status(404).send({ msg: "Comment not found" });
            }
        } catch (error) {
            error.origin = 'comment';
            error.suborigin = 'update';
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const comment = await Comment
                .findOne({ _id: req.params._id, active: true })
                .populate({
                    path: 'author',
                    select: { username: 1, avatar: 1, role: 1 }
                })
                .populate({
                    path: 'likes',
                    select: { username: 1, avatar: 1, role: 1 }
                });
            return res.send({ msg: "Comment", comment });
        } catch (error) {
            error.origin = 'comment';
            error.suborigin = 'getById';
            next(error);
        }
    },
    async getByPostId(req, res, next) {
        try {
            // Pagination
            let { page = 1, limit = 10 } = req.query;
            // Limit per page:
            if (isNaN(limit)) { limit = 10; }
            limit = Math.max(1, Math.min(limit, 20));
            const total = await Comment.count({
                postId: req.params.postId, active: true
            });
            const maxPages = Math.ceil(total / limit);
            // Current page
            if (isNaN(page)) { page = 1; }
            page = Math.max(1, Math.min(page, maxPages));
            const comments = await Comment
                .find({ postId: req.params.postId, active: true })
                .sort('-createdAt')
                .limit(limit)
                .skip(limit * (page - 1))
                .populate('author', { username: 1, avatar: 1, role: 1 })
            return res.send({
                msg: "Comments by PostId", total, page, maxPages, comments
            });
        } catch (error) {
            error.origin = 'comment';
            error.suborigin = 'getByPostId';
            next(error);
        }
    },
    async like(req, res, next) {
        try {
            const comment = await Comment.findOneAndUpdate(
                { _id: req.params._id, likes: { $nin: req.user._id }, active: true },
                { $push: { likes: req.user._id } },
                { new: true }
            );
            if (comment) {
                await User.findByIdAndUpdate(
                    req.user._id,
                    { $push: { likedComments: comment._id } }
                );
                return res.send({ msg: "Comment liked", _id: comment._id });
            } else {
                return res.status(400).send({ msg: "Error liking comment" });
            }
        } catch (error) {
            error.origin = 'comment';
            error.suborigin = 'like';
            next(error);
        }
    },
    async unlike(req, res, next) {
        try {
            const comment = await Comment.findByIdAndUpdate(
                req.params._id,
                { $pull: { likes: req.user._id } }
            );
            if (comment) {
                await User.findByIdAndUpdate(
                    req.user._id,
                    { $pull: { likedComments: comment._id } }
                );
                return res.send({ msg: "Comment unliked", _id: comment._id });
            } else {
                res.status(400).send({ msg: "Error unliking comment" });
            }
        } catch (error) {
            error.origin = 'comment';
            error.suborigin = 'unlike';
            next(error);
        }
    }
};

module.exports = CommentController;