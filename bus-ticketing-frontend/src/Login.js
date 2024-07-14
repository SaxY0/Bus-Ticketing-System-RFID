import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ handleLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await handleLogin(username, password); // Pass username and password to handleLogin function

      // Navigate to traveler dashboard after successful login
      navigate('/traveler-dashboard');
    } catch (error) {
      console.error('Login failed:', error.message);
      setError('Invalid username or password'); // Set a generic error message for failed login
    }
  };

  return (
    <div>
      <h2>Traveler Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if present */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
