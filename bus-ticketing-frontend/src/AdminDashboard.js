import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = ({ adminName }) => {
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');

  const [assignUsername, setAssignUsername] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [assignedDate, setAssignedDate] = useState('');
  const [assignMessage, setAssignMessage] = useState('');

  const [deleteUsername, setDeleteUsername] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  const [travelers, setTravelers] = useState([]);
  const [selectedTraveler, setSelectedTraveler] = useState('');

  useEffect(() => {
    fetchTravelers();
  }, []);

  // Function to fetch travelers from backend
  const fetchTravelers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/travelers');
      if (!response.ok) {
        throw new Error('Failed to fetch travelers');
      }
      const data = await response.json();
      setTravelers(data.travelers);
    } catch (error) {
      console.error('Error fetching travelers:', error.message);
      // Handle error (e.g., show error message to user)
    }
  };

  // Function to register a new traveler
  const handleRegisterTraveler = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: registerUsername, password: registerPassword, name: registerName, email: registerEmail }),
      });
      if (!response.ok) {
        throw new Error('Failed to register traveler');
      }
      const data = await response.json();
      setRegisterMessage(data.message);
      // Refresh travelers list after registration
      fetchTravelers();
    } catch (error) {
      console.error('Error registering traveler:', error.message);
      // Handle error (e.g., show error message to user)
    }
  };

  // Function to assign an RFID card to a traveler
  const handleAssignRFIDCard = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/${selectedTraveler}/assign-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardNumber, assignedDate }),
      });
      if (!response.ok) {
        throw new Error('Failed to assign RFID card');
      }
      const data = await response.json();
      setAssignMessage(data.message);
      // Refresh travelers list after assigning RFID card
      fetchTravelers();
    } catch (error) {
      console.error('Error assigning RFID card:', error.message);
      // Handle error (e.g., show error message to user)
    }
  };

  // Function to delete a traveler
  const handleDeleteTraveler = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/${selectedTraveler}/delete`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete traveler');
      }
      const data = await response.json();
      setDeleteMessage(data.message);
      // Refresh travelers list after deleting traveler
      fetchTravelers();
    } catch (error) {
      console.error('Error deleting traveler:', error.message);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <div>
      <h2>Welcome, Admin {adminName}!</h2>
      <div>
        <h3>Register Traveler</h3>
        <input
          type="text"
          placeholder="Username"
          value={registerUsername}
          onChange={(e) => setRegisterUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Name"
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
        />
        <button onClick={handleRegisterTraveler}>Register</button>
        {registerMessage && <p>{registerMessage}</p>}
      </div>
      <div>
        <h3>Assign RFID Card</h3>
        <select
          value={selectedTraveler}
          onChange={(e) => setSelectedTraveler(e.target.value)}
        >
          <option value="">Select Traveler</option>
          {travelers.map(traveler => (
            <option key={traveler.user_id} value={traveler.user_id}>
              {traveler.username}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Card Number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
        />
        <input
          type="date"
          value={assignedDate}
          onChange={(e) => setAssignedDate(e.target.value)}
        />
        <button onClick={handleAssignRFIDCard}>Assign Card</button>
        {assignMessage && <p>{assignMessage}</p>}
      </div>
      <div>
        <h3>Delete Traveler</h3>
        <select
          value={selectedTraveler}
          onChange={(e) => setSelectedTraveler(e.target.value)}
        >
          <option value="">Select Traveler</option>
          {travelers.map(traveler => (
            <option key={traveler.user_id} value={traveler.user_id}>
              {traveler.username}
            </option>
          ))}
        </select>
        <button onClick={handleDeleteTraveler}>Delete</button>
        {deleteMessage && <p>{deleteMessage}</p>}
      </div>
      <div>
        <Link to="/" onClick={() => localStorage.clear()}>
          Logout
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
