import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Users from './pages/Users';
import Posts from './pages/Posts';
import CreatePost from './pages/CreatePost';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

const GET_TAGS = gql`
  query {
    tags
  }
`;

function App() {
  const { loading, error, data } = useQuery(GET_TAGS);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home tags={data.tags} />} />
          <Route path="/users" element={<Users />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/create" element={<CreatePost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <footer>
        <p>© 2023 Social Network</p>
      </footer>
    </div>
  );
}

export default App;