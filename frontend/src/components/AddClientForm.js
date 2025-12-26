import React, { useState, useEffect } from 'react';
import FormWrapper from './FormWrapper';
import './Form.css';
import * as api from '../services/api';

const AddClientForm = ({ onCancel, onClientAdded, admin }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [graylogHost, setGraylogHost] = useState('');
  const [graylogUsername, setGraylogUsername] = useState('');
  const [graylogPassword, setGraylogPassword] = useState('');
  const [graylogStreamId, setGraylogStreamId] = useState('');
  const [logApiHost, setLogApiHost] = useState('');
  const [logApiUsername, setLogApiUsername] = useState('');
  const [logApiPassword, setLogApiPassword] = useState('');
  const [adminId, setAdminId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (admin) {
      setAdminId(admin.id);
    }
  }, [admin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const clientData = {
      name,
      url,
      description,
      graylog: graylogHost ? { host: graylogHost, username: graylogUsername, password: graylogPassword, streamId: graylogStreamId } : null,
      logApi: logApiHost ? { host: logApiHost, username: logApiUsername, password: logApiPassword } : null,
      adminId: adminId || undefined,
    };

    try {
      const newClient = await api.addClient(clientData);
      onClientAdded(newClient);
      onCancel();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <FormWrapper title="Add New Client" onCancel={onCancel}>
      <form onSubmit={handleSubmit} className="form-container">
        {error && <div className="error-message">{error}</div>}
        {admin && <input type="hidden" value={adminId} />}
        <div className="form-group">
          <label htmlFor="clientName">Client Name</label>
          <input
            type="text"
            id="clientName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="clientUrl">Dashboard URL</label>
          <input
            type="url"
            id="clientUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="clientDescription">Description</label>
          <textarea
            id="clientDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="form-section">
          <h3>Graylog Configuration</h3>
          <div className="form-group">
            <label htmlFor="graylogHost">Graylog Host</label>
            <input
              type="text"
              id="graylogHost"
              value={graylogHost}
              onChange={(e) => setGraylogHost(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="graylogUsername">Username</label>
            <input
              type="text"
              id="graylogUsername"
              value={graylogUsername}
              onChange={(e) => setGraylogUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="graylogPassword">Password</label>
            <input
              type="password"
              id="graylogPassword"
              value={graylogPassword}
              onChange={(e) => setGraylogPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="graylogStreamId">Stream ID</label>
            <input
              type="text"
              id="graylogStreamId"
              value={graylogStreamId}
              onChange={(e) => setGraylogStreamId(e.target.value)}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>SIEM UI Configuration</h3>
          <div className="form-group">
            <label htmlFor="logApiHost">Frontend Host</label>
            <input
              type="text"
              id="logApiHost"
              value={logApiHost}
              onChange={(e) => setLogApiHost(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="logApiUsername">Username</label>
            <input
              type="text"
              id="logApiUsername"
              value={logApiUsername}
              onChange={(e) => setLogApiUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="logApiPassword">Password</label>
            <input
              type="password"
              id="logApiPassword"
              value={logApiPassword}
              onChange={(e) => setLogApiPassword(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="form-submit-btn">Add Client</button>
      </form>
    </FormWrapper>
  );
};

export default AddClientForm;