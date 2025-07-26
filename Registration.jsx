import React, { useRef } from 'react';
import { useState } from "react";
import '../CSS/UserProcesses.css';

function Registration() {
  const inputRef = useRef(null);
  const [inputs, setInputs] = useState({});

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    });

    const data = await response.json();
    console.log('Response from backend:', data);
    alert(`Server says: ${data.message}`);
  } catch (error) {
    console.error('Error sending form data:', error);
  }
 };
 
  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({...values, [name]: value}))
  }

  return (
    <div className="main-container">
      <div className="form-container">
        <h2>Registration</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="email" placeholder="Email" value={inputs.email || ""} onChange={handleChange} />
          <input type="text" name="username" placeholder="Username" value={inputs.username || ""} onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" value={inputs.password || ""} onChange={handleChange} />
          <input type="password" name="confpass" placeholder="Confirm Password" value={inputs.confpass || ""} onChange={handleChange} />
          <button className="opacity">SUBMIT</button>
        </form>
      </div>
    </div>
  );
}

export default Registration;