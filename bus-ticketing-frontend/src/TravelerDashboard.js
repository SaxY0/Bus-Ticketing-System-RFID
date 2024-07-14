import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TravelerDashboard = ({ travelerName }) => {
  const [busTimings, setBusTimings] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpMessage, setTopUpMessage] = useState('');

  // Fetch bus timings function
  const fetchBusTimings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/bus/timings');
      if (!response.ok) {
        throw new Error('Failed to fetch bus timings');
      }
      const data = await response.json();
      setBusTimings(data);
    } catch (error) {
      console.error('Error fetching bus timings:', error.message);
      // Handle error (e.g., show error message to user)
    }
  };

  // Fetch wallet balance function
  const fetchWalletBalance = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/traveler/${localStorage.getItem('userId')}/wallet/balance`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch wallet balance');
      }
      const data = await response.json();
      setWalletBalance(data.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error.message);
      // Handle error (e.g., show error message to user)
    }
  };

  // Function to top up wallet balance
  const handleTopUpBalance = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/traveler/${localStorage.getItem('userId')}/wallet/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
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
      // Handle error (e.g., show error message to user)
    }
  };

  useEffect(() => {
    fetchBusTimings();
    fetchWalletBalance();
  }, []);

  return (
    <div>
      <h2>Welcome, {travelerName}!</h2>
      <div>
        <h3>Bus Timings</h3>
        {busTimings.length > 0 ? (
          <ul>
            {busTimings.map((timing) => (
              <li key={timing.id}>{timing.time}</li>
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
        <Link to="/" onClick={() => localStorage.clear()}>
          Logout
        </Link>
      </div>
    </div>
  );
};

export default TravelerDashboard;
