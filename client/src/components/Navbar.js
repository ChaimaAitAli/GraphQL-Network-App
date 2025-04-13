import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <header className="header">
            <h1>Social Network</h1>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/users">Users</Link>
                <Link to="/posts">Posts</Link>
                {user ? (
                    <>
                        <span style={{ marginRight: "10px", fontWeight: "bold" }}> Welcome, {user.firstName}</span>
                        <button onClick={logout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Navbar;