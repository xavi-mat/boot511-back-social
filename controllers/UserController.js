const { User, Post, Comment } = require("../models/");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const MAIN_URL = process.env.MAIN_URL;
const transporter = require("../config/nodemailer");
const confirmEmailHTML = require("../templates/confirmEmailHTML");
const fs = require("fs");  // Used for the fakeEmail
const { faker } = require("@faker-js/faker");

const UserController = {
    async register(req, res, next) {
        try {
            // Need data
            if (!req.body.username || !req.body.email || !req.body.password) {
                return res.status(400).send({ msg: "Data required: username, email, password" });
            }
            req.body.role = "user"; // Assing role by default
            req.body.passhash = bcrypt.hashSync(req.body.password, 10);
            req.body.avatar = MAIN_URL + '/avatars/avatar.png';
            req.body.confirmed = false;
            req.body.active = true;
            const user = await User.create(req.body);
            const emailToken = jwt.sign(
                { email: req.body.email },
                JWT_SECRET,
                { expiresIn: "48h", }
            );
            const url = MAIN_URL + "/users/confirm/" + emailToken;
            const confirmEmailContent = confirmEmailHTML(
                req.body.username,
                req.body.email,
                emailToken,
                MAIN_URL
            );

            // Need a working email:
            // await transporter.sendMail({
            //     to: req.body.email,
            //     subject: "Confirme su registro",
            //     html: confirmEmailContent,
            // });

            // Fake email: Create html web with link
            fs.writeFileSync('public/fakeEmail.html', confirmEmailContent);
            return res.status(201).send({
                msg: "We have sent a mail to confirm the registration",
                user,
            });
        } catch (error) {
            error.origin = 'user';
            error.suborigin = 'create';
            next(error);
        }
    },
    async confirmEmail(req, res, next) {
        try {
            const token = req.params.emailToken;
            const payload = jwt.verify(token, JWT_SECRET);
            await User.updateOne(
                { email: payload.email },
                { confirmed: true }
            );
            return res.send('<a href="' + MAIN_URL + '">Go to the main page</a>');
        } catch (error) {
            error.origin = 'user';
            error.suborigin = 'confirmEmail';
            next(error);
        }
    },
    async cleanAll(req, res, next) {
        try {
            // Empty all
            const users = await User.deleteMany({});
            const posts = await Post.deleteMany({});
            const comments = await Comment.deleteMany({});
            // Put 10 users
            const usersId = [];
            for (let i = 0; i < 10; i++) {
                const user = {
                    username: faker.name.findName(),
                    email: `fake${i}@email.com`,
                    passhash: bcrypt.hashSync('123456', 10),
                    avatar: faker.internet.avatar(),
                    role: i === 0 ? "admin" : "user",
                    confirmed: true,
                    active: true,
                };
                const newUser = await User.create(user);
                usersId.push(newUser._id);
            }
            // Write 30 posts
            usersId.forEach(async (userId) => {
                for (let i = 0; i < 3; i++) {
                    const post = {
                        title: faker.lorem.sentence(),
                        body: faker.lorem.paragraph(),
                        author: userId,
                        image: faker.image.cats(300, 300, true),
                    };
                    const newPost = await Post.create(post);
                    await User.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });
                    for (let i = 0; i < 2; i++) {
                        const comment = {
                            postId: newPost._id,
                            text: faker.lorem.paragraph(),
                            author: usersId[Math.floor(Math.random() * usersId.length)],
                            image: faker.image.cats(300, 300, true),
                        };
                        const newComment = await Comment.create(comment);
                        await Post.findByIdAndUpdate(newPost._id, { $push: { comments: newComment._id } });
                        await User.findByIdAndUpdate(comment.author, { $push: { comments: newComment._id } });
                    }
                }
            });
            return res.send({ msg: "Cleaned", users, posts, comments })
        } catch (error) {
            error.origin = 'user';
            error.suborigin = 'cleanAll';
            next(error);
        }
    },
    async login(req, res, next) {
        try {
            const user = await User.findOne({ email: req.body.email })
                .populate({ path: "posts", select: { title: 1 } })
                .populate({ path: "likedPosts", select: { title: 1 } })
                .populate({ path: "following", select: { username: 1 } })
                .populate({ path: "followers", select: { username: 1 } })
            if (!user) {
                return res.status(400).send({ msg: "Wrong credentials" });
            }
            const passwordMatch = await bcrypt.compare(req.body.password, user.passhash);
            if (!passwordMatch) {
                return res.status(400).send({ msg: "Wrong credentials" });
            }
            if (!user.confirmed) {
                return res.send({ msg: "Please, confirm your email" });
            }
            const token = jwt.sign({ _id: user._id }, JWT_SECRET);
            while (user.tokens.length > 4) {
                user.tokens.shift();
            }
            user.tokens.push(token);
            await user.save();
            return res.send({ msg: `Welcome ${user.username}`, token, user });
        } catch (error) {
            error.origin = 'user';
            error.suborigin = 'login';
            next(error);
        }
    },
    async getData(req, res, next) {
        try {
            const user = await User.findById(
                req.user._id)
                // { tokens: 0, confirmed: 0, active: 0, passhash: 0 })
                .populate('posts', { author: 0 })
                .populate('comments', { author: 0, postId: 0 })
                .populate({ path: 'followers', select: { username: 1, avatar: 1, role: 1 } });
            return res.send({
                msg: "User data",
                user,
                // followersCount: user.followers.length
            });
        } catch (error) {
            error.origin = 'user';
            error.suborigin = 'getData';
            next(error);
        }
    },
    async logout(req, res, next) {
        try {
            await User.findByIdAndUpdate(
                req.user._id,
                { $pull: { tokens: req.headers.authorization } }
            );
            return res.send({ msg: "Logout successful" });
        } catch (error) {
            error.origin = 'user';
            error.suborigin = 'logout';
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            // Can only update some fields: avatar, password and username
            const updatedUser = {};
            updatedUser.avatar = req.file ?
                `${MAIN_URL}/avatars/${req.file.filename}` :
                undefined;
            updatedUser.passhash = req.body.password ?
                bcrypt.hashSync(req.body.password, 10) :
                undefined;
            updatedUser.username = req.body.username ?
                req.body.username :
                undefined;
            const user = await User.findByIdAndUpdate(
                req.user._id,
                updatedUser,
                { new: true }
            );
            return res.send({ msg: "Updated", user });
        } catch (error) {
            error.origin = 'user';
            error.suborigin = 'update';
            next(error);
        }
    },
    async follow(req, res, next) {
        try {
            if (req.user._id.toString() === req.params._id) {
                return res.send({ msg: "Cant't follow yourself" });
            }
            const user = await User.findOneAndUpdate(
                { _id: req.params._id, followers: { $nin: req.user._id } },
                { $push: { followers: req.user._id } }
            );
            if (user) {
                await User.findByIdAndUpdate(
                    req.user._id,
                    { $push: { following: req.params._id } }
                );
                return res.send({ msg: "Following" })
            } else {
                return res.status(400).send({ msg: 'Error following user' });
            }
        } catch (error) {
            error.origin = 'user';
            error.suborigin = 'follow';
            next(error);
        }
    },
    async unfollow(req, res, next) {
        try {
            const user = await User.findOneAndUpdate(
                { _id: req.params._id, followers: { $in: req.user._id } },
                { $pull: { followers: req.user._id } }
            );
            if (user) {
                await User.findByIdAndUpdate(
                    req.user._id,
                    { $pull: { following: req.params._id } }
                );
                return res.send({ msg: "Unfollowing" });
            } else {
                return res.status(400).send({ msg: 'Error unfollowing user' });
            }
        } catch (error) {
            error.origin = 'user';
            error.suborigin = 'unfollow';
            next(error);
        }
    },
    async searchByUsername(req, res, next) {
        try {
            let { page = 1, limit = 10, name } = req.query;
            if (name === undefined) {
                return res.status(400).send({ msg: 'name is required' });
            }
            if (name.length > 30) {
                return res.status(400).send({ msg: "Search string too long" });
            }
            // Pagination
            if (isNaN(limit)) { limit = 10; }
            limit = Math.max(1, Math.min(limit, 20));
            const username = new RegExp(name, 'i');
            const total = await User.count({ username, role: { $nin: 'admin' } });
            const maxPages = Math.ceil(total / limit);
            // Current page
            if (isNaN(page)) { page = 1; }
            page = Math.max(1, Math.min(page, maxPages))
            const users = await User.find(
                { username, role: { $nin: 'admin' } },
                { username: 1, avatar: 1, role: 1 })
                .limit(limit)
                .skip(limit * (page - 1));
            return res.send({ msg: "Users found", total, page, maxPages, users });
        } catch (error) {
            error.origin = 'user';
            error.suborigin = 'searchByUsername';
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const user = await User.findById(
                req.params._id,
                { email: 0, passhash: 0, role: 0, confirmed: 0, tokens: 0 })
                .populate({ path: 'posts', select: { title: 1 } })
                .populate({ path: 'likedPosts', select: { title: 1 } })
                .populate({ path: 'following', select: { username: 1 } })
                .populate({ path: 'followers', select: { username: 1 } })
            return res.send({ msg: "User data", user });
        } catch (error) {
            error.origin = 'user';
            error.suborigin = 'getById';
            next(error);
        }
    },
    async delete(req, res, next) {
        try {
            const user = await User.findById(req.user._id);
            if (user) {
                // User existed: Cleaning
                // Delete references to user from followers
                user.followers.forEach(async (userId) => {
                    await User.findByIdAndUpdate(userId,
                        { $pull: { following: req.user._id } }
                    );
                });
                // Delete references to user from following
                user.following.forEach(async (userId) => {
                    await User.findByIdAndUpdate(userId,
                        { $pull: { followers: req.user._id } }
                    );
                });
                // Delete references to user in likedPosts
                user.likedPosts.forEach(async (postId) => {
                    await Post.findByIdAndUpdate(postId,
                        { $pull: { likes: req.user._id } }
                    );
                });
                // Delete references to user in likedComments
                user.likedComments.forEach(async (commentId) => {
                    await Comment.findByIdAndUpdate(commentId,
                        { $pull: { likes: req.user._id } }
                    );
                });
                // Delete user's Comments (and clean)
                user.comments.forEach(async (commentId) => {
                    const comment = await Comment.findOneAndDelete(
                        { _id: commentId, author: req.user._id }
                    );
                    if (comment) {
                        // Comment existed: Cleaning
                        // Delete reference to this comment from Post
                        await Post.findByIdAndUpdate(comment.postId,
                            { $pull: { comments: comment._id } }
                        );
                        // Delete references to this comments from 'likes'
                        //  (users who liked this comment)
                        comment.likes.forEach(async (userId) => {
                            await User.findByIdAndUpdate(userId,
                                { $pull: { likedComments: comment._id } });
                        });
                    }
                });
                // Delete user's Post (and clean)
                user.posts.forEach(async (postId) => {
                    // Delete post
                    const post = await Post.findOneAndDelete(
                        { _id: req.params._id, author: req.user._id }
                    );
                    if (post) {
                        // Post existed: Cleaning
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
                    }
                });
                // Finally, delete the user
                await User.deleteOne({ _id: req.user._id });
                return res.send({ msg: "User deleted" });
            } else {
                return res.status(500).send({ msg: "Error deleting user" });
            }

        } catch (error) {
            error.origin = 'user';
            error.suborigin = 'delete';
            next(error);
        }
    }
}

module.exports = UserController;