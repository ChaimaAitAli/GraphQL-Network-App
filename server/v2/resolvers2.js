import { User, Post, Comment } from '../models.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { formatDate } from '../i18n.js';
import {
    BodyNotValidError,
    ParamsNotValidError,
    ResourceNotFoundError,
    ServerError
} from "../errors.js";

const sortOptions = {
    createdAt_asc: { createdAt: 1 },
    createdAt_desc: { createdAt: -1 },
    registerDate_asc: { registerDate: 1 },
    registerDate_desc: { registerDate: -1 },
    likes_asc: { likes: 1 },
    likes_desc: { likes: -1 }
};

export const resolvers = {
    Query: {
        apiInfo: (_, __, { language }) => {
            return {
                version: "2.0",
                releaseDate: formatDate(new Date(), language),
                deprecated: false
            };
        },

        // User Queries with Pagination
        users: async (_, { page = 1, limit = 10, sort = "registerDate_desc", filter }, context) => {
            try {
                const skip = (page - 1) * limit;
                const query = {};

                if (filter) {
                    if (filter.firstName) query.firstName = { $regex: filter.firstName, $options: "i" };
                    if (filter.lastName) query.lastName = { $regex: filter.lastName, $options: "i" };
                    if (filter.gender) query.gender = filter.gender;
                }

                const totalUsers = await User.countDocuments(query);

                let users;

                users = await User.find(query)
                    .sort(sortOptions[sort] || { registerDate: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select("-email"); // Exclude email field

                return {
                    data: users,
                    pagination: {
                        totalRecords: totalUsers,
                        totalPages: Math.ceil(totalUsers / limit),
                        currentPage: page,
                        hasNextPage: page * limit < totalUsers,
                        hasPreviousPage: page > 1
                    }
                };
            } catch (error) {
                throw new ServerError("Failed to fetch users");
            }
        },

        user: async (_, { id }) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    throw new ParamsNotValidError("Invalid user ID format");
                }

                const user = await User.findById(id);
                if (!user) {
                    throw new ResourceNotFoundError("User not found");
                }
                return user;
            } catch (error) {
                throw error instanceof ParamsNotValidError || error instanceof ResourceNotFoundError
                    ? error
                    : new ServerError("Failed to fetch user");
            }
        },

        searchUsers: async (_, { query, page = 1, limit = 10 }) => {
            try {
                const skip = (page - 1) * limit;
                const regex = new RegExp(query, "i"); // Case-insensitive search

                const totalUsers = await User.countDocuments({
                    $or: [
                        { firstName: regex },
                        { lastName: regex },
                        { email: regex },
                        { phone: regex }
                    ]
                });

                const users = await User.find({
                    $or: [
                        { firstName: regex },
                        { lastName: regex },
                        { email: regex },
                        { phone: regex }
                    ]
                })
                    .skip(skip)
                    .limit(limit);

                return {
                    data: users,
                    pagination: {
                        totalRecords: totalUsers,
                        totalPages: Math.ceil(totalUsers / limit),
                        currentPage: page,
                        hasNextPage: page * limit < totalUsers,
                        hasPreviousPage: page > 1
                    }
                };
            } catch (error) {
                throw new ServerError("Failed to search users");
            }
        },

        // Post Queries with Pagination
        posts: async (_, { page = 1, limit = 10, sort = "createdAt_desc", filter }) => {
            try {
                const query = {};

                if (filter) {
                    if (filter.text) query.text = { $regex: filter.text, $options: "i" };
                    if (filter.owner) query.owner = filter.owner;
                    if (filter.tags) query.tags = { $in: filter.tags };
                    if (filter.publishDate) query.publishDate = { $gte: new Date(filter.publishDate) };
                }
                const skip = (page - 1) * limit;
                const totalPosts = await Post.countDocuments(query);

                const posts = await Post.find(query)
                    .sort(sortOptions[sort] || { publishDate: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('owner');

                return {
                    data: posts,
                    pagination: {
                        totalRecords: totalPosts,
                        totalPages: Math.ceil(totalPosts / limit),
                        currentPage: page,
                        hasNextPage: page * limit < totalPosts,
                        hasPreviousPage: page > 1
                    }
                };
            } catch (error) {
                throw new ServerError("Failed to fetch posts");
            }
        },

        post: async (_, { id }) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    throw new ParamsNotValidError("Invalid post ID format");
                }

                const post = await Post.findById(id).populate('owner');
                if (!post) {
                    throw new ResourceNotFoundError("Post not found");
                }
                return post;
            } catch (error) {
                throw error instanceof ParamsNotValidError || error instanceof ResourceNotFoundError
                    ? error
                    : new ServerError("Failed to fetch post");
            }
        },
        searchPosts: async (_, { query, page = 1, limit = 10 }) => {
            try {
                const skip = (page - 1) * limit;
                const regex = new RegExp(query, "i"); // Case-insensitive search

                const totalPosts = await Post.countDocuments({
                    $or: [
                        { text: regex },
                        { tags: regex },
                        { link: regex }
                    ]
                });

                const posts = await Post.find({
                    $or: [
                        { text: regex },
                        { tags: regex },
                        { link: regex }
                    ]
                })
                    .populate("owner")
                    .skip(skip)
                    .limit(limit);

                return {
                    data: posts,
                    pagination: {
                        totalRecords: totalPosts,
                        totalPages: Math.ceil(totalPosts / limit),
                        currentPage: page,
                        hasNextPage: page * limit < totalPosts,
                        hasPreviousPage: page > 1
                    }
                };
            } catch (error) {
                throw new ServerError("Failed to search posts");
            }
        },

        commentsByPost: async (_, { postId, page = 1, limit = 10, sort = "createdAt_desc", filter }) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(postId)) {
                    throw new ParamsNotValidError("Invalid post ID format");
                }
                const query = { post: postId };

                if (filter) {
                    if (filter.message) query.message = { $regex: filter.message, $options: "i" };
                    if (filter.publishDate) query.publishDate = { $gte: new Date(filter.publishDate) };
                }

                const skip = (page - 1) * limit;
                const totalComments = await Comment.countDocuments(query);

                const comments = await Comment.find(query)
                    .sort(sortOptions[sort] || { publishDate: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('owner');

                return {
                    data: comments,
                    pagination: {
                        totalRecords: totalComments,
                        totalPages: Math.ceil(totalComments / limit),
                        currentPage: page,
                        hasNextPage: page * limit < totalComments,
                        hasPreviousPage: page > 1
                    }
                };
            } catch (error) {
                throw new ServerError("Failed to fetch comments");
            }
        },
        commentsByUser: async (_, { userId, page = 1, limit = 10, sort = "createdAt_desc", filter }) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(userId)) {
                    throw new ParamsNotValidError("Invalid user ID format");
                }

                const query = { owner: userId };

                if (filter) {
                    if (filter.message) query.message = { $regex: filter.message, $options: "i" };
                    if (filter.publishDate) query.publishDate = { $gte: new Date(filter.publishDate) };
                }

                const skip = (page - 1) * limit;
                const totalComments = await Comment.countDocuments(query);

                const comments = await Comment.find(query)
                    .sort(sortOptions[sort] || { publishDate: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('owner');

                return {
                    data: comments,
                    pagination: {
                        totalRecords: totalComments,
                        totalPages: Math.ceil(totalComments / limit),
                        currentPage: page,
                        hasNextPage: page * limit < totalComments,
                        hasPreviousPage: page > 1
                    }
                };
            } catch (error) {
                throw new ServerError("Failed to fetch comments");
            }
        },

        postsByUser: async (_, { userId, page = 1, limit = 10, sort = "createdAt_desc" }) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(userId)) {
                    throw new ParamsNotValidError("Invalid user ID format");
                }

                const skip = (page - 1) * limit;
                const totalPosts = await Post.countDocuments({ owner: userId });

                const posts = await Post.find({ owner: userId })
                    .sort(sortOptions[sort] || { publishDate: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('owner');

                return {
                    data: posts,
                    pagination: {
                        totalRecords: totalPosts,
                        totalPages: Math.ceil(totalPosts / limit),
                        currentPage: page,
                        hasNextPage: page * limit < totalPosts,
                        hasPreviousPage: page > 1
                    }
                };
            } catch (error) {
                throw new ServerError("Failed to fetch posts");
            }
        },
        postsByTag: async (_, { tag, page = 1, limit = 10, sort = "createdAt_desc" }) => {
            try {
                const skip = (page - 1) * limit;
                const totalPosts = await Post.countDocuments({ tags: tag });

                const sortOptions = {
                    createdAt_asc: { createdAt: 1 },
                    created_desc: { createdAt: -1 },
                    likes_asc: { likes: 1 },
                    likes_desc: { likes: -1 }
                }

                const posts = await Post.find({ tags: tag })
                    .sort(sortOptions[sort] || { createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('owner');

                return {
                    data: posts,
                    pagination: {
                        totalRecords: totalPosts,
                        totalPages: Math.ceil(totalPosts / limit),
                        currentPage: page,
                        hasNextPage: page * limit < totalPosts,
                        hasPreviousPage: page > 1
                    }
                };
            } catch (error) {
                throw new ServerError("Failed to fetch posts by tag");
            }
        },

        tags: async () => {
            try {
                // Get all posts and extract their tags
                const posts = await Post.find({});

                // Collect all tags from all posts
                let allTags = [];
                posts.forEach(post => {
                    if (post.tags && post.tags.length > 0) {
                        allTags = [...allTags, ...post.tags];
                    }
                });

                // Remove duplicates and return
                const uniqueTags = [...new Set(allTags)];
                return uniqueTags;
            } catch (error) {
                throw new ServerError("Failed to fetch tags");
            }
        },
    },

    Mutation: {
        // User Mutations
        createUser: async (_, { input }) => {
            try {
                const { idempotencyKey, ...userData } = input;

                if (!userData.firstName || !userData.lastName || !userData.email) {
                    throw new BodyNotValidError("Missing required fields: firstName, lastName, email");
                }

                if (idempotencyKey) {
                    const existingUser = await User.findOne({ idempotencyKey });
                    if (existingUser) return existingUser;
                }

                const newUser = new User({ ...userData, idempotencyKey });
                await newUser.save();
                return newUser;
            } catch (error) {
                throw error.name === 'ValidationError'
                    ? new BodyNotValidError(`Validation error: ${error.message}`)
                    : error.code === 11000
                        ? new BodyNotValidError("Email already exists")
                        : new ServerError("Failed to create user");
            }
        },

        updateUser: async (_, { id, input }) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    throw new ParamsNotValidError("Invalid user ID format");
                }

                const user = await User.findByIdAndUpdate(id, input, { new: true });
                if (!user) {
                    throw new ResourceNotFoundError("User not found");
                }
                return user;
            } catch (error) {
                throw error instanceof ParamsNotValidError || error instanceof ResourceNotFoundError
                    ? error
                    : new ServerError("Failed to update user");
            }
        },

        deleteUser: async (_, { id }) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    throw new ParamsNotValidError("Invalid user ID format");
                }

                const user = await User.findByIdAndDelete(id);
                if (!user) {
                    throw new ResourceNotFoundError("User not found");
                }
                return id;
            } catch (error) {
                throw error instanceof ParamsNotValidError || error instanceof ResourceNotFoundError
                    ? error
                    : new ServerError("Failed to delete user");
            }
        },

        // Post Mutations
        createPost: async (_, { input }) => {
            try {
                const { idempotencyKey, ...postData } = input;

                if (!postData.text || !postData.owner) {
                    throw new BodyNotValidError("Missing required fields: text, owner");
                }

                if (!mongoose.Types.ObjectId.isValid(postData.owner)) {
                    throw new ParamsNotValidError("Invalid owner ID format");
                }

                if (idempotencyKey) {
                    const existingPost = await Post.findOne({ idempotencyKey });
                    if (existingPost) return existingPost;
                }

                const newPost = new Post({ ...postData, idempotencyKey });
                await newPost.save();
                return newPost.populate('owner');
            } catch (error) {
                throw new ServerError("Failed to create post");
            }
        },

        // Comment Mutations
        createComment: async (_, { input }) => {
            try {
                const { message, owner, post } = input;

                // Validate required fields
                if (!message || !owner || !post) {
                    throw new BodyNotValidError("Missing required fields: message, owner, post");
                }

                // Validate ID formats
                if (!mongoose.Types.ObjectId.isValid(owner)) {
                    throw new ParamsNotValidError("Invalid owner ID format");
                }
                if (!mongoose.Types.ObjectId.isValid(post)) {
                    throw new ParamsNotValidError("Invalid post ID format");
                }

                // Check if post exists
                const postExists = await Post.findById(post);
                if (!postExists) {
                    throw new ResourceNotFoundError("Post not found");
                }

                // Check if owner exists
                const ownerExists = await User.findById(owner);
                if (!ownerExists) {
                    throw new ResourceNotFoundError("User not found");
                }

                // Create new comment
                const newComment = new Comment({
                    message,
                    owner,
                    post,
                    publishDate: input.publishDate || new Date().toISOString()
                });

                await newComment.save();

                // Populate owner before returning
                return newComment.populate('owner');
            } catch (error) {
                throw error instanceof BodyNotValidError ||
                    error instanceof ParamsNotValidError ||
                    error instanceof ResourceNotFoundError
                    ? error
                    : new ServerError("Failed to create comment");
            }
        },

        deleteComment: async (_, { id }) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    throw new ParamsNotValidError("Invalid comment ID format");
                }

                const comment = await Comment.findByIdAndDelete(id);
                if (!comment) {
                    throw new ResourceNotFoundError("Comment not found");
                }
                return id;
            } catch (error) {
                throw error instanceof ParamsNotValidError || error instanceof ResourceNotFoundError
                    ? error
                    : new ServerError("Failed to delete comment");
            }
        },
        login: async (_, { email }) => {
            try {
                // Find user by email
                const user = await User.findOne({ email });
                if (!user) {
                    throw new Error('No user found with this email');
                }

                // Generate JWT token
                const token = jwt.sign(
                    { userId: user.id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: '1d' }
                );

                return {
                    token,
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                    }
                };
            } catch (error) {
                throw new Error(`Login failed: ${error.message}`);
            }
        }
    },

    // Nested Resolvers
    Post: {
        owner: async (post) => {
            try {
                return post.owner?.id ? post.owner : await User.findById(post.owner);
            } catch {
                throw new ServerError("Failed to fetch post owner");
            }
        },
    },

    Comment: {
        owner: async (comment) => {
            try {
                return comment.owner?.id ? comment.owner : await User.findById(comment.owner);
            } catch {
                throw new ServerError("Failed to fetch comment owner");
            }
        },
        post: async (comment) => {
            try {
                return comment.post?.id ? comment.post : await Post.findById(comment.post);
            } catch {
                throw new ServerError("Failed to fetch comment post");
            }
        }
    }
};
