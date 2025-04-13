import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Link } from 'react-router-dom';

const GET_POSTS = gql`
  query GetPosts($page: Int, $limit: Int) {
    posts(page: $page, limit: $limit) {
      data {
        id
        text
        likes
        tags
        owner {
          firstName
          lastName
        }
      }
      pagination {
        totalRecords
        currentPage
        totalPages
      }
    }
  }
`;

const Posts = () => {
    const [page, setPage] = useState(1);
    const limit = 5;

    const { loading, error, data } = useQuery(GET_POSTS, {
        variables: { page, limit }
    });

    if (loading) return <div>Loading posts...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const { posts } = data;

    return (
        <div>
            <div className="header-row">
                <h2>Posts</h2>
                <Link to="/posts/create" className="button">Create Post</Link>
            </div>
            <div>
                {posts.data.map(post => (
                    <div key={post.id} className="card">
                        <h3>{post.owner.firstName} {post.owner.lastName}</h3>
                        <p>{post.text}</p>
                        <div className="tags">
                            {post.tags.map((tag, index) => (
                                <React.Fragment key={tag}>
                                    <span className="tag">{tag}</span>
                                    {index < post.tags.length - 1 && <span className="tag-separator">, </span>}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="likes" style={{ color: "blue", fontWeight: "bold" }}>Likes: {post.likes}</div>
                    </div>
                ))}
            </div>
            <div className="pagination">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </button>
                <span>Page {posts.pagination.currentPage} of {posts.pagination.totalPages}</span>
                <button
                    disabled={page === posts.pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Posts;