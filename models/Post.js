const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'post content is required'],
        minLength: [3, 'post must be 3 characters minimum'],
        maxLength: [280, 'post must be 280 characters maximum'],
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'a valid post author\'s userId is required'],
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
    active: { type: Boolean, default: true },
}, { timestamps: true });

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
