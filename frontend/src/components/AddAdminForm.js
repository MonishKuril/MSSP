import React, { useState } from 'react';
import FormWrapper from './FormWrapper';
import './Form.css';
import * as api from '../services/api';

const AddAdminForm = ({ onCancel, onAdminAdded }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const adminData = {
      username,
      password,
      name,
      email,
      organization,
      city,
      state,
    };

    try {
      const newAdmin = await api.addAdmin(adminData);
      onAdminAdded(newAdmin);
      onCancel(); // Close the form view on success
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <FormWrapper title="Add New Admin" onCancel={onCancel}>
      <form onSubmit={handleSubmit} className="form-container">
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="adminUsername">Admin Username</label>
          <input
            type="text"
            id="adminUsername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="adminPassword">Admin Password</label>
          <input
            type="password"
            id="adminPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="adminName">Name</label>
          <input
            type="text"
            id="adminName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="adminEmail">Email ID</label>
          <input
            type="email"
            id="adminEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="adminOrganization">Organization Name</label>
          <input
            type="text"
            id="adminOrganization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="adminCity">City</label>
          <input
            type="text"
            id="adminCity"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="adminState">State</label>
          <input
            type="text"
            id="adminState"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="form-submit-btn">Add Admin</button>
      </form>
    </FormWrapper>
  );
};

export default AddAdminForm;
