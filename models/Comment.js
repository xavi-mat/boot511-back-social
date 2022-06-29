const mongoose = require('mongoose');
const ObjectId = mongoose.SchemaTypes.ObjectId;

const CommentSchema = new mongoose.Schema({
    postId: {
        type: ObjectId,
        ref: "Post",
        required: [true, 'postId is required'],
    },
    text: {
        type: String,
        required: [true, 'text is required'],
    },
    author: {
        type: ObjectId,
        ref: "User",
        required: [true, 'Comment author\'s userId is required'],
    },
    image: String,
    likes: [{
        type: ObjectId,
        ref: "User",
    }],
}, { timestamps: true });

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
