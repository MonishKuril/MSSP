import React, { useState, useEffect } from 'react';
import FormWrapper from './FormWrapper';
import './Form.css';
import * as api from '../services/api';

const EditClientForm = ({ onCancel, onClientUpdated, client }) => {
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
  const [error, setError] = useState(null);

  useEffect(() => {
    if (client) {
      setName(client.name || '');
      setUrl(client.url || '');
      setDescription(client.description || '');
      setGraylogHost(client.graylog_host || '');
      setGraylogUsername(client.graylog_username || '');
      setGraylogPassword(''); // Clear password for security
      setGraylogStreamId(client.graylog_stream_id || '');
      setLogApiHost(client.log_api_host || '');
      setLogApiUsername(client.log_api_username || '');
      setLogApiPassword(''); // Clear password for security
    }
  }, [client]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const graylogData = graylogHost ? {
      host: graylogHost,
      username: graylogUsername,
      streamId: graylogStreamId,
    } : null;
    if (graylogData && graylogPassword) {
      graylogData.password = graylogPassword;
    }

    const logApiData = logApiHost ? {
      host: logApiHost,
      username: logApiUsername,
    } : null;
    if (logApiData && logApiPassword) {
      logApiData.password = logApiPassword;
    }

    const clientData = {
      name,
      url,
      description,
      graylog: graylogData,
      logApi: logApiData,
    };

    try {
      const updatedClient = await api.updateClient(client.id, clientData);
      onClientUpdated(updatedClient);
      onCancel();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <FormWrapper title="Edit Client" onCancel={onCancel}>
      <form onSubmit={handleSubmit} className="form-container">
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="editClientName">Client Name</label>
          <input
            type="text"
            id="editClientName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="editClientUrl">Dashboard URL</label>
          <input
            type="url"
            id="editClientUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="editClientDescription">Description</label>
          <textarea
            id="editClientDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="form-section">
          <h3>Graylog Configuration</h3>
          <div className="form-group">
            <label htmlFor="editGraylogHost">Graylog Host</label>
            <input
              type="text"
              id="editGraylogHost"
              value={graylogHost}
              onChange={(e) => setGraylogHost(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="editGraylogUsername">Username</label>
            <input
              type="text"
              id="editGraylogUsername"
              value={graylogUsername}
              onChange={(e) => setGraylogUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="editGraylogPassword">Password</label>
            <input
              type="password"
              id="editGraylogPassword"
              value={graylogPassword}
              onChange={(e) => setGraylogPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="editGraylogStreamId">Stream ID</label>
            <input
              type="text"
              id="editGraylogStreamId"
              value={graylogStreamId}
              onChange={(e) => setGraylogStreamId(e.target.value)}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>SEIM UI Configuration</h3>
          <div className="form-group">
            <label htmlFor="editLogApiHost">API Host</label>
            <input
              type="text"
              id="editLogApiHost"
              value={logApiHost}
              onChange={(e) => setLogApiHost(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="editLogApiUsername">Username</label>
            <input
              type="text"
              id="editLogApiUsername"
              value={logApiUsername}
              onChange={(e) => setLogApiUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="editLogApiPassword">Password</label>
            <input
              type="password"
              id="editLogApiPassword"
              value={logApiPassword}
              onChange={(e) => setLogApiPassword(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="form-submit-btn">Update Client</button>
      </form>
    </FormWrapper>
  );
};

export default EditClientForm;