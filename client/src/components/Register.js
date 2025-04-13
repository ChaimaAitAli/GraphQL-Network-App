import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      id
      firstName
      lastName
      email
    }
  }
`;

export default function Register() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [createUser, { loading }] = useMutation(CREATE_USER, {
        onError: (err) => {
            setError(err.message);
        },
        onCompleted: () => {
            navigate('/login');
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate form data
        if (!form.firstName || !form.lastName || !form.email) {
            setError('All fields are required');
            return;
        }

        try {
            const response = await createUser({
                variables: {
                    input: {
                        firstName: form.firstName,
                        lastName: form.lastName,
                        email: form.email
                    }
                }
            });

            console.log('Registration response:', response);

            if (response.data && response.data.createUser) {
                // Success - user was created
                alert('Registration successful!');
                navigate('/login');
            } else {
                // No error but also no user data returned
                setError('Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(`Registration failed: ${err.message}`);
        }
    };

    return (
        <div className="auth-form">
            <h2>Register</h2>
            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>First Name:</label>
                    <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Last Name:</label>
                    <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            <p className="auth-link">Already have an account? <a href="/login">Login here</a></p>
        </div>
    );
}