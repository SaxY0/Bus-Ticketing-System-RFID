import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import TravelerDashboard from './TravelerDashboard';
import Login from './Login'; // Import the Login component

const App = () => {
  const [loggedInUser, setLoggedInUser] = useState(null); // Track logged-in user

  const handleAdminLogin = async (username, password) => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const userData = await response.json();
      setLoggedInUser({ username: userData.username, role: 'admin' });
    } catch (error) {
      console.error('Admin login failed:', error.message);
      throw error;
      // Handle login failure (e.g., show error message to user)
    }
  };

  const handleTravelerLogin = async (username, password) => {
    try {
      const response = await fetch('http://localhost:3001/api/traveler/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error); // Throw the specific error message from the backend
      }

      const userData = await response.json();
      setLoggedInUser({ username: userData.username, role: 'traveler' });
    } catch (error) {
      console.error('Traveler login failed:', error.message);
      throw error;
      // Handle login failure (e.g., show error message to user)
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null); // Clear logged-in user state
    // Redirect to the landing page after logout
    window.location.href = '/'; // Use window.location.href for full-page reload
  };

  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/admin-login">Admin Login</Link>
            </li>
            <li>
              <Link to="/traveler-login">Traveler Login</Link>
            </li>
            {loggedInUser && (
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            )}
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin-login" element={<AdminLogin handleAdminLogin={handleAdminLogin} />} />
          <Route path="/traveler-login" element={<Login handleLogin={handleTravelerLogin} />} />
          <Route path="/admin-dashboard" element={<AdminDashboard adminName={loggedInUser?.username} />} />
          <Route path="/traveler-dashboard" element={<TravelerDashboard travelerName={loggedInUser?.username} />} />
          {/* Add a default route in case none of the above match */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
