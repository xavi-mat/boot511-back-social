const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'post title is required'],
    },
    body: {
        type: String,
        required: [true, 'post content is required'],
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, , 'post author\'s userId is required'],
    },
    image: String,
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
}, { timestamps: true });

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
