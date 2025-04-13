import React, { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const CREATE_POST = gql`
  mutation CreatePost($input: PostInput!) {
    createPost(input: $input) {
      id
      text
      owner {
        id
        firstName
        lastName
      }
    }
  }
`;

const CreatePost = () => {
    const [formState, setFormState] = useState({
        text: '',
        tags: ''
    });
    const navigate = useNavigate();
    const { user } = useAuth();

    const [createPost] = useMutation(CREATE_POST, {
        variables: {
            input: {
                text: formState.text,
                tags: formState.tags.split(',').map(tag => tag.trim()),
                owner: user?.id
            }
        },
        onCompleted: () => {
            navigate('/posts');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        createPost();
    };

    return (
        <div>
            <h2>Create New Post</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Content:</label>
                    <textarea
                        value={formState.text}
                        onChange={(e) => setFormState({ ...formState, text: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label>Tags (comma separated):</label>
                    <input
                        type="text"
                        value={formState.tags}
                        onChange={(e) => setFormState({ ...formState, tags: e.target.value })}
                    />
                </div>
                <button type="submit">Create Post</button>
            </form>
        </div>
    );
};

export default CreatePost;