'use strict';
const { User, Post, Comment } = require("../models/");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const authentication = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({ msg: "Unauthorized" });
        }
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne(
            { _id: payload._id, tokens: token }
        );
        if (!user) {
            return res.status(401).send({ msg: "Unauthorized" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Token error" });
    }
}

const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).send({ msg: "Forbidden" });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error" })
    }
}

const isPostAuthor = async (req, res, next) => {
    try {
        const post = await Post.findOne(
            { _id: req.params._id, author: req.user._id }
        );
        if (!post) {
            return res.status(403).send({ msg: "Forbidden" });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error" })
    }
}

const isCommentAuthor = async (req, res, next) => {
    try {
        const comment = await Comment.findOne(
            { _id: req.params._id, author: req.user._id }
        );
        if (!comment) {
            return res.status(403).send({ msg: "Forbidden" });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error" })
    }
}

module.exports = { authentication, isAdmin, isPostAuthor, isCommentAuthor };
