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
        trim: true,
        maxLength: [280, 'post must be 280 characters maximum'],
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
    active: { type: Boolean, default: true },
}, { timestamps: true });

CommentSchema.methods.toJSON = function () {
    const comment = this._doc;
    comment.likesCount = this._doc.likes?.length;
    delete comment.likes;
    return comment;
}

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
