import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
const UserSchema = new mongoose.Schema({
    idempotencyKey: { type: String, unique: true, sparse: true },
    title: { type: String, enum: ['mr', 'miss', 'dr', ''], default: '' },
    firstName: { type: String, required: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, required: true, minlength: 2, maxlength: 50 },
    gender: { type: String, enum: ['male', 'female'] },
    email: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date },
    registerDate: { type: Date, default: Date.now },
    phone: { type: String },
    picture: { type: String },
    location: {
        street: { type: String, minlength: 5, maxlength: 100 },
        city: { type: String, minlength: 2, maxlength: 30 },
        state: { type: String, minlength: 2, maxlength: 30 },
        country: { type: String, minlength: 2, maxlength: 30 },
        timezone: { type: String },
    },
});


const PostSchema = new mongoose.Schema({
    idempotencyKey: { type: String, unique: true, sparse: true },
    text: { type: String, required: true, minlength: 6, maxlength: 1000 },
    image: { type: String },
    likes: { type: Number, default: 0 },
    tags: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publishDate: { type: Date, default: Date.now },
});

const CommentSchema = new mongoose.Schema({
    message: { type: String, required: true, minlength: 2, maxlength: 500 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    publishDate: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', UserSchema);
export const Post = mongoose.model('Post', PostSchema);
export const Comment = mongoose.model('Comment', CommentSchema);