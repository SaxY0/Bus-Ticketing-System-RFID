import React from 'react';
import { Link } from 'react-router-dom'; // If using React Router for navigation

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="content">
        <h1>Welcome to Our Bus Ticketing System</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla convallis libero ut
          condimentum lobortis. Cras pellentesque blandit tellus, id viverra ipsum euismod vitae.
          Integer volutpat lacus ut turpis vestibulum, ac interdum ante scelerisque. Nullam
          sollicitudin mi a ex pharetra, eget faucibus metus malesuada.
        </p>
        <p>
          In hac habitasse platea dictumst. Fusce at bibendum mauris. Duis ac enim a mi vehicula
          iaculis. Morbi et elit quis sapien tristique blandit.
        </p>
        <p>
          Phasellus id velit eu mauris faucibus vehicula. Suspendisse potenti. Sed ultricies purus
          magna, id venenatis lacus luctus sed. Nulla facilisi.
        </p>
        <div className="button-container">
          <Link to="/traveler-login">
            <button className="login-button">Login as Traveler</button>
          </Link>
          <Link to="/admin-login">
            <button className="login-button admin">Login as Admin</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
