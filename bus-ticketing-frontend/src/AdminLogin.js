import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ handleAdminLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await handleAdminLogin(username, password);
      // Redirect to admin dashboard on successful login
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('Admin login failed:', error.message);
      setError('Invalid username or password');
    }
  };

  return (
    <div>
      <h2>Admin Login</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
