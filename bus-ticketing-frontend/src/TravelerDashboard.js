import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PastTrips from './PastTrips'; // Import the new component

const TravelerDashboard = ({ travelerName }) => {
  const [busTimings, setBusTimings] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpMessage, setTopUpMessage] = useState('');
  const [showPastTrips, setShowPastTrips] = useState(false); // State for showing past trips
  const [stops, setStops] = useState([]);
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');

  // Fetch bus timings function
  const fetchBusTimings = async () => {
    if (!fromStop || !toStop) {
      // Skip fetching if either stop is not selected
      setBusTimings([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/traveler/bus-timings/${fromStop}/${toStop}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch bus timings');
      }
      const data = await response.json();
      setBusTimings(data.busTimings);
    } catch (error) {
      console.error('Error fetching bus timings:', error.message);
      setBusTimings([]);
    }
  };

  // Fetch stops function
  const fetchStops = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/stops');
      if (!response.ok) {
        throw new Error('Failed to fetch stops');
      }
      const data = await response.json();
      setStops(data.stops);
    } catch (error) {
      console.error('Error fetching stops:', error.message);
    }
  };

  // Fetch wallet balance function
  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token available');
      }
  
      const response = await fetch(`http://localhost:3001/api/traveler/wallet`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch wallet balance: ${errorData.error}`);
      }
  
      const data = await response.json();
      setWalletBalance(data.balance); // Assuming setWalletBalance is a state updater function
  
    } catch (error) {
      console.error('Error fetching wallet balance:', error.message);
    }
  };

  // Function to top up wallet balance
  const handleTopUpBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token available');
      }
      const response = await fetch(`http://localhost:3001/api/traveler/wallet/top-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: topUpAmount })
      });
      if (!response.ok) {
        throw new Error('Failed to top up wallet balance');
      }
      const data = await response.json();
      setTopUpMessage(data.message);
      // Fetch updated wallet balance after topping up
      fetchWalletBalance();
    } catch (error) {
      console.error('Error topping up wallet balance:', error.message);
    }
  };

  // Handle from stop change
  const handleFromStopChange = (e) => {
    setFromStop(e.target.value);
  };

  // Handle to stop change
  const handleToStopChange = (e) => {
    setToStop(e.target.value);
  };

  useEffect(() => {
    fetchStops();
    fetchWalletBalance();
  }, []);

  useEffect(() => {
    fetchBusTimings();
  }, [fromStop, toStop]);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.clear();
  };

  // Function to toggle showing past trips
  const toggleShowPastTrips = () => {
    setShowPastTrips(!showPastTrips);
  };

  return (
    <div>
      <h2>Welcome, {travelerName}!</h2>
      <div>
        <h3>Bus Timings</h3>
        <div>
          <label>Select From Stop:</label>
          <select value={fromStop} onChange={handleFromStopChange}>
            <option value="">Select From Stop</option>
            {stops.map(stop => (
              <option key={stop.stop_id} value={stop.stop_id}>{stop.stop_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Select To Stop:</label>
          <select value={toStop} onChange={handleToStopChange}>
            <option value="">Select To Stop</option>
            {stops
              .filter(stop => stop.stop_id !== fromStop) // Hide selected boarding point from destination options
              .map(stop => (
                <option key={stop.stop_id} value={stop.stop_id}>{stop.stop_name}</option>
              ))}
          </select>
        </div>
        {busTimings.length > 0 ? (
          <ul>
            {busTimings.map((timing) => (
              <li key={timing.id}>
                Bus Number: {timing.bus_number}<br />
                Arrival Time: {timing.arrival_time}<br />
                Departure Time: {timing.departure_time}<br />
                Reach Time: {timing.reach_time}
              </li>
            ))}
          </ul>
        ) : (
          <p>No bus timings available</p>
        )}
      </div>
      <div>
        <h3>Wallet Balance</h3>
        <p>{walletBalance !== null ? `$${walletBalance}` : 'Loading...'}</p>
      </div>
      <div>
        <h3>Top Up Wallet</h3>
        <input
          type="number"
          placeholder="Enter amount"
          value={topUpAmount}
          onChange={(e) => setTopUpAmount(e.target.value)}
        />
        <button onClick={handleTopUpBalance}>Top Up</button>
        {topUpMessage && <p>{topUpMessage}</p>}
      </div>
      <div>
        <Link to="/" onClick={handleLogout}>
          Logout
        </Link>
      </div>
      <div>
        <h3>View Past Trips</h3>
        <button onClick={toggleShowPastTrips}>
          {showPastTrips ? 'Hide Past Trips' : 'Show Past Trips'}
        </button>
        {showPastTrips && <PastTrips />}
      </div>
    </div>
  );
};

export default TravelerDashboard;
