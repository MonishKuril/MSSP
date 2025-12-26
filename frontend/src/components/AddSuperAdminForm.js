import React, { useState } from 'react';
import FormWrapper from './FormWrapper';
import './Form.css';
import * as api from '../services/api';

const AddSuperAdminForm = ({ onCancel, onSuperAdminAdded }) => {
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
      const newSuperAdmin = await api.addSuperAdmin(adminData);
      onSuperAdminAdded(newSuperAdmin);
      onCancel();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <FormWrapper title="Add New Superadmin" onCancel={onCancel}>
      <form onSubmit={handleSubmit} className="form-container">
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="superAdminUsername">Superadmin Username</label>
          <input
            type="text"
            id="superAdminUsername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="superAdminPassword">Superadmin Password</label>
          <input
            type="password"
            id="superAdminPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="superAdminName">Name</label>
          <input
            type="text"
            id="superAdminName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="superAdminEmail">Email ID</label>
          <input
            type="email"
            id="superAdminEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="superAdminOrganization">Organization Name</label>
          <input
            type="text"
            id="superAdminOrganization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="superAdminCity">City</label>
          <input
            type="text"
            id="superAdminCity"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="superAdminState">State</label>
          <input
            type="text"
            id="superAdminState"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="form-submit-btn">Add Superadmin</button>
      </form>
    </FormWrapper>
  );
};

export default AddSuperAdminForm;
