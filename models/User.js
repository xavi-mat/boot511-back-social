const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: [true, 'username required'],
        minLength: [3, 'username must be 3 characters minimum'],
        maxLength: [40, 'username must be 40 characters maximum'],
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: [true, 'email required'],
        maxLength: [50, 'email must be 50 characters maximum'],
    },
    passhash: String,
    avatar: String,
    role: {
        type: String,
        default: 'user',
        enum: {
            values: ['admin', 'mod', 'vip', 'user'],
            message: 'invalid role: "{VALUE}"'
        },
    },
    confirmed: Boolean,
    active: Boolean,
    tokens: [String],
    posts: [{ type: ObjectId, ref: "Post" }],
    comments: [{ type: ObjectId, ref: "Comment" }],
    likedPosts: [{ type: ObjectId, ref: "Post" }],
    likedComments: [{ type: ObjectId, ref: "Comments" }],
    following: [{ type: ObjectId, ref: "User", }],
    followers: [{ type: ObjectId, ref: "User", }],
}, { timestamps: true });

UserSchema.methods.toJSON = function () {
    const user = this._doc;
    user.followersCount = this._doc.followers?.length;
    delete user.tokens;
    delete user.passhash;
    delete user.confirmed;
    return user;
}

const User = mongoose.model('User', UserSchema);

module.exports = User;
