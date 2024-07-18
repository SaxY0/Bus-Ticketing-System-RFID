import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = ({ adminName }) => {
  // Existing states
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');

  const [cardNumber, setCardNumber] = useState('');
  const [assignedDate, setAssignedDate] = useState('');
  const [assignMessage, setAssignMessage] = useState('');

  const [deleteMessage, setDeleteMessage] = useState('');

  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeMessage, setRechargeMessage] = useState('');

  const [selectedTraveler, setSelectedTraveler] = useState('');
  const [travelers, setTravelers] = useState([]);
  const [selectedTravelerBalance, setSelectedTravelerBalance] = useState(null);

  // New states for bus management
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [reachTime, setReachTime] = useState('');
  const [busMessage, setBusMessage] = useState('');

  const [busIdToRemove, setBusIdToRemove] = useState('');
  const [removeBusMessage, setRemoveBusMessage] = useState('');

  useEffect(() => {
    fetchTravelers();
  }, []);

  // Existing functions...

  // Fetch travelers from backend
  const fetchTravelers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/travelers', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch travelers');
      }
      const data = await response.json();
      setTravelers(data.travelers);
    } catch (error) {
      console.error('Error fetching travelers:', error.message);
    }
  };

  // Fetch current balance of selected traveler
  const fetchTravelerBalance = async (travelerId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/traveler/${travelerId}/balance`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch traveler balance');
      }
      const data = await response.json();
      setSelectedTravelerBalance(data.balance);
    } catch (error) {
      console.error('Error fetching traveler balance:', error.message);
    }
  };

  // Register a new traveler
  const handleRegisterTraveler = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ username: registerUsername, password: registerPassword, name: registerName, email: registerEmail }),
      });
      if (!response.ok) {
        throw new Error('Failed to register traveler');
      }
      const data = await response.json();
      setRegisterMessage(data.message);
      fetchTravelers();
    } catch (error) {
      console.error('Error registering traveler:', error.message);
    }
  };

  // Assign RFID card to a traveler
  const handleAssignRFIDCard = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/${selectedTraveler}/assign-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cardNumber, assignedDate }),
      });
      if (!response.ok) {
        throw new Error('Failed to assign RFID card');
      }
      const data = await response.json();
      setAssignMessage(data.message);
      fetchTravelers();
    } catch (error) {
      console.error('Error assigning RFID card:', error.message);
    }
  };

  // Delete a traveler
  const handleDeleteTraveler = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/${selectedTraveler}/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete traveler');
      }
      const data = await response.json();
      setDeleteMessage(data.message);
      fetchTravelers();
    } catch (error) {
      console.error('Error deleting traveler:', error.message);
    }
  };

  // Recharge traveler balance
  const handleRechargeBalance = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/traveler/${selectedTraveler}/recharge`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rechargeAmount }),
      });
      if (!response.ok) {
        throw new Error('Failed to recharge balance');
      }
      const data = await response.json();
      setRechargeMessage(data.message);
      fetchTravelerBalance(selectedTraveler);
      fetchTravelers();
    } catch (error) {
      console.error('Error recharging balance:', error.message);
    }
  };

  // Handle selection of traveler
  const handleTravelerSelect = async (travelerId) => {
    setSelectedTraveler(travelerId);
    fetchTravelerBalance(travelerId);
  };

  // Add a new bus
  const handleAddBus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/bus-timings/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ fromStop, toStop, busNumber, arrivalTime, departureTime, reachTime }),
      });
      if (!response.ok) {
        throw new Error('Failed to add bus');
      }
      const data = await response.json();
      setBusMessage(data.message);
      // Optionally refresh bus list if you are maintaining it in the state
    } catch (error) {
      console.error('Error adding bus:', error.message);
    }
  };

  // Remove a bus
  const handleRemoveBus = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/bus-timings/${busIdToRemove}/remove`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
      });
      if (!response.ok) {
        throw new Error('Failed to remove bus');
      }
      const data = await response.json();
      setRemoveBusMessage(data.message);
      // Optionally refresh bus list if you are maintaining it in the state
    } catch (error) {
      console.error('Error removing bus:', error.message);
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
          onChange={(e) => handleTravelerSelect(e.target.value)}
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
        <h3>Recharge Traveler Balance</h3>
        <select
          value={selectedTraveler}
          onChange={(e) => handleTravelerSelect(e.target.value)}
        >
          <option value="">Select Traveler</option>
          {travelers.map(traveler => (
            <option key={traveler.user_id} value={traveler.user_id}>
              {traveler.username}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Recharge Amount"
          value={rechargeAmount}
          onChange={(e) => setRechargeAmount(e.target.value)}
        />
        <button onClick={handleRechargeBalance}>Recharge Balance</button>
        {rechargeMessage && <p>{rechargeMessage}</p>}
        {selectedTravelerBalance !== null && (
          <p>Current Balance: ${selectedTravelerBalance}</p>
        )}
      </div>
      <div>
        <h3>Delete Traveler</h3>
        <select
          value={selectedTraveler}
          onChange={(e) => handleTravelerSelect(e.target.value)}
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
        <h3>Add New Bus</h3>
        <input
          type="text"
          placeholder="From Stop"
          value={fromStop}
          onChange={(e) => setFromStop(e.target.value)}
        />
        <input
          type="text"
          placeholder="To Stop"
          value={toStop}
          onChange={(e) => setToStop(e.target.value)}
        />
        <input
          type="text"
          placeholder="Bus Number"
          value={busNumber}
          onChange={(e) => setBusNumber(e.target.value)}
        />
        <input
          type="time"
          placeholder="Arrival Time"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
        />
        <input
          type="time"
          placeholder="Departure Time"
          value={departureTime}
          onChange={(e) => setDepartureTime(e.target.value)}
        />
        <input
          type="time"
          placeholder="Reach Time"
          value={reachTime}
          onChange={(e) => setReachTime(e.target.value)}
        />
        <button onClick={handleAddBus}>Add Bus</button>
        {busMessage && <p>{busMessage}</p>}
      </div>
      <div>
        <h3>Remove Bus</h3>
        <input
          type="text"
          placeholder="Bus ID"
          value={busIdToRemove}
          onChange={(e) => setBusIdToRemove(e.target.value)}
        />
        <button onClick={handleRemoveBus}>Remove Bus</button>
        {removeBusMessage && <p>{removeBusMessage}</p>}
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
