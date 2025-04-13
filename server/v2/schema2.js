export const typeDefs = `#graphql
  type ApiInfo {
    version: String!
    releaseDate: String!
    deprecated: Boolean!
  }

  extend type Query {
    apiInfo: ApiInfo!
  }

  type User {
    id: ID!
    title: String
    firstName: String!
    lastName: String!
    picture: String
    gender: String
    email: String
    dateOfBirth: String
    registerDate: String
    phone: String
    location: Location  
  }

  type Location {
    street: String
    city: String
    state: String
    country: String
    timezone: String
  }

  type Post {
    id: ID!
    text: String!
    image: String
    likes: Int!
    link: String
    tags: [String]
    publishDate: String
    owner: User!
  }

  type Comment {
    id: ID!
    message: String!
    owner: User!
    post: ID!
    publishDate: String
  }

  input UserInput {
    idempotencyKey: ID
    title: String
    firstName: String!
    lastName: String!
    gender: String
    email: String!
    dateOfBirth: String
    phone: String
    picture: String
    location: LocationInput
  }

  # optional fields for updating a user
  input UpdateUserInput {
    idempotencyKey: ID
    title: String
    firstName: String
    lastName: String
    gender: String
    email: String
    dateOfBirth: String
    phone: String
    picture: String
    location: LocationInput
  }

  input LocationInput {
    street: String
    city: String
    state: String
    country: String
    timezone: String
  }

   
  input PostInput {
    idempotencyKey: ID
    text: String!
    image: String
    likes: Int
    link: String
    tags: [String]
    owner: ID!
  }

  # optional fields for updating a post
  input UpdatePostInput {
    idempotencyKey: ID
    text: String
    image: String
    likes: Int
    link: String
    tags: [String]
    owner: ID
  }

  input CommentInput {
    message: String!
    owner: ID!
    post: ID!
    publishDate: String
  }

  input PostFilterInput {
  text: String
  owner: ID
  tags: [String]
  publishDate: String
}

input CommentFilterInput {
  message: String
  publishDate: String
}

input UserFilterInput {
  firstName: String
  lastName: String
  gender: String
  email: String
}


  type Query {
    # User Queries
    users( page: Int, limit: Int, sort: String, filter: UserFilterInput): UsersResponse!
    user(id: ID!): User

    # Post Queries
    posts(page: Int, limit: Int, sort: String, filter: PostFilterInput): PostsResponse!
    post(id: ID!): Post
    postsByUser(userId: ID!, page: Int, limit: Int, sort: String, filter: PostFilterInput): PostsResponse!
    postsByTag(tag: String!, page: Int, limit: Int, sort: String, filter: PostFilterInput): PostsResponse!

    # Comment Queries
    commentsByPost(postId: ID!, page: Int, limit: Int, sort: String, filter: CommentFilterInput): CommentsResponse!
    commentsByUser(userId: ID!, page: Int, limit: Int, sort: String, filter: CommentFilterInput): CommentsResponse!

    # Tag Queries
    tags: [String!]!

    #Search Queries
    searchUsers(query: String!, page: Int, limit: Int): UsersResponse!
    searchPosts(query: String!, page: Int, limit: Int): PostsResponse!

  }

  type Mutation {
    # User Mutations
    createUser(input: UserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): ID!

    # Post Mutations
    createPost(input: PostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): ID!

    # Comment Mutations
    createComment(input: CommentInput!): Comment!
    deleteComment(id: ID!): ID!

    login(email: String!): AuthPayload
  }


  # for Pagination
  
  type Pagination {
    totalRecords: Int!
    totalPages: Int!
    currentPage: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
}

type UsersResponse {
    data: [User]!
    pagination: Pagination!
}

type PostsResponse {
    data: [Post]!
    pagination: Pagination!
}

type CommentsResponse {
    data: [Comment]!
    pagination: Pagination!
}

type AuthPayload {
  token: String!
  user: User!
}

`;