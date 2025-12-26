import React, { useState, useEffect } from 'react';
import FormWrapper from './FormWrapper';
import './Form.css';
import * as api from '../services/api';

const EditAdminForm = ({ onCancel, onAdminUpdated, admin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (admin) {
      setName(admin.name || '');
      setEmail(admin.email || '');
      setOrganization(admin.organization || '');
      setCity(admin.city || '');
      setState(admin.state || '');
    }
  }, [admin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const adminData = {
      name,
      email,
      organization,
      city,
      state,
    };

    try {
      const updatedAdmin = await api.updateAdmin(admin.id, adminData);
      onAdminUpdated(updatedAdmin);
      onCancel();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <FormWrapper title="Edit Admin" onCancel={onCancel}>
      <form onSubmit={handleSubmit} className="form-container">
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="editAdminName">Name</label>
          <input
            type="text"
            id="editAdminName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="editAdminEmail">Email ID</label>
          <input
            type="email"
            id="editAdminEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="editAdminOrganization">Organization Name</label>
          <input
            type="text"
            id="editAdminOrganization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="editAdminCity">City</label>
          <input
            type="text"
            id="editAdminCity"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="editAdminState">State</label>
          <input
            type="text"
            id="editAdminState"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="form-submit-btn">Update Admin</button>
      </form>
    </FormWrapper>
  );
};

export default EditAdminForm;