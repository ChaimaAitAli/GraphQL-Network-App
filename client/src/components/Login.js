import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const LOGIN = gql`
  mutation Login($email: String!) {
    login(email: $email) {
      token
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export default function Login() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const [loginMutation, { loading }] = useMutation(LOGIN, {
        onError: (err) => {
            console.error('Login error:', err);
            setError(err.message || 'Login failed. Please try again.');
        },
        onCompleted: (data) => {
            if (data && data.login && data.login.token) {
                login(data.login.token, data.login.user);
                navigate('/');
            } else {
                setError('Login response is missing token or user data');
            }
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email is required');
            return;
        }

        try {
            console.log('Attempting login with email:', email);
            await loginMutation({
                variables: { email }
            });
        } catch (err) {
            console.error('Login submission error:', err);
            setError(`Login failed: ${err.message}`);
        }
    };

    return (
        <div className="auth-form">
            <h2>Login</h2>
            {error && <div className="error" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p>Don't have an account? <a href="/register">Register here</a></p>
        </div>
    );
}