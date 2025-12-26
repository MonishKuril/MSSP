import React, { useState, useEffect, useCallback } from 'react';
import './ManagementView.css';
import * as api from '../services/api';
import AddClientForm from './AddClientForm';
import EditClientForm from './EditClientForm';
import AddAdminForm from './AddAdminForm';
import AddSuperAdminForm from './AddSuperAdminForm';
import EditAdminForm from './EditAdminForm';

const ManagementView = ({ user }) => {
  const [clients, setClients] = useState([]); 
  const [admins, setAdmins] = useState([]);
  const [activeForm, setActiveForm] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [addingClientForAdmin, setAddingClientForAdmin] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      if (user.role === 'admin') {
        const clientsData = await api.getClients();
        setClients(clientsData);
      }
      if (user.role === 'superadmin' || user.role === 'main-superadmin') {
        const adminsData = await api.getAdmins();
        setAdmins(adminsData);
      }
    } catch (error) {
      console.error('Error fetching data for management view:', error);
    }
  }, [user.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleFormSuccess = () => {
      fetchData();
      setActiveForm(null);
  }

  if (user.role === 'superadmin' || user.role === 'main-superadmin') {
    let content;
    switch (activeForm) {
      case 'addAdmin':
        content = <AddAdminForm onCancel={() => setActiveForm(null)} onAdminAdded={handleFormSuccess} />;
        break;
      case 'addSuperAdmin':
        content = <AddSuperAdminForm onCancel={() => setActiveForm(null)} onSuperAdminAdded={handleFormSuccess} />;
        break;
      case 'editAdmin':
        content = <EditAdminForm onCancel={() => setActiveForm(null)} onAdminUpdated={handleFormSuccess} admin={editingAdmin} />;
        break;
      case 'addClient':
        content = <AddClientForm onCancel={() => setActiveForm(null)} onClientAdded={handleFormSuccess} admin={addingClientForAdmin} />;
        break;
      default:
        content = (
          <>
            <div className="panel-header">
              <h2>Admin Management</h2>
              <div>
                {user.role === 'main-superadmin' && (
                  <button onClick={() => setActiveForm('addSuperAdmin')} className="action-btn" style={{ display: 'inline-block' }}>
                    + Add New Superadmin
                  </button>
                )}
                <button onClick={() => setActiveForm('addAdmin')} className="action-btn">+ Add New Admin</button>
              </div>
            </div>
            <div className="admins-table-container">
              <table className="admins-table">
              <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email ID</th>
                <th>Organization Name</th>
                <th>City</th>
                <th>State</th>
                <th>Deployed Clients</th>
                <th>Active Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="adminsTableBody">
              {admins.map(admin => {
                const adminClients = admin.clients || [];
                return (
                  <tr key={admin.id}>
                    <td>{admin.id}</td>
                    <td>{admin.name}</td>
                    <td>{admin.email}</td>
                    <td>{admin.organization}</td>
                    <td>{admin.city}</td>
                    <td>{admin.state}</td>
                    <td>
                      <select className="admin-clients-dropdown" onChange={(e) => {
                        const url = e.target.value;
                        if (url) {
                          window.open(url, '_blank');
                          e.target.value = '';
                        }
                      }}>
                        {adminClients.length === 0 ? (
                          <option value="" disabled>No clients assigned</option>
                        ) : (
                          <>
                            <option value="">Select Client</option>
                            {adminClients.map(client => (
                              <option key={client.id} value={client.url}>
                                {client.name}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </td>
                    <td className={`admin-status ${admin.blocked ? 'blocked' : 'active'}`}>
                      {admin.blocked ? 'Blocked' : 'Active'}
                    </td>
                    <td className="table-actions">
                      <button className="table-btn add-client-btn" onClick={() => {setAddingClientForAdmin(admin); setActiveForm('addClient')}}>New Client</button>
                      <button className="table-btn edit-admin-btn" onClick={() => {setEditingAdmin(admin); setActiveForm('editAdmin')}}>Edit Admin</button>
                      <button className="table-btn block-admin-btn" onClick={() => api.toggleAdminBlock(admin.id, admin.blocked).then(fetchData)}>
                        {admin.blocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
              </table>
            </div>
          </>
        );
    }

    return (
      <div id="superAdminView" className="management-panel">
        {content}
      </div>
    );
  }

  // Admin View
  let adminContent;
  switch (activeForm) {
    case 'addClient':
      adminContent = <AddClientForm onCancel={() => setActiveForm(null)} onClientAdded={handleFormSuccess} />;
      break;
    case 'editClient':
      adminContent = <EditClientForm onCancel={() => setActiveForm(null)} onClientUpdated={handleFormSuccess} client={editingClient} />;
      break;
    default:
        adminContent = (
            <>
                <div className="panel-header">
                    <h2 id="managementTitle">Client Management</h2>
                    <button id="addClientBtn" className="action-btn" onClick={() => setActiveForm('addClient')}>+ Add New Client</button>
                </div>
                <div className="clients-table-container">
                    <table className="clients-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>URL</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody id="clientsTableBody">
                        {clients.map(client => (
                            <tr key={client.id}>
                            <td>{client.name}</td>
                            <td>{client.url}</td>
                            <td>{client.description}</td>
                            <td className="table-actions">
                                <button className="table-btn view-client-btn" onClick={() => window.open(client.url, '_blank')}>View</button>
                                <button className="table-btn edit-client-btn" onClick={() => {setEditingClient(client); setActiveForm('editClient')}}>Edit</button>
                                <button className="table-btn delete-client-btn" onClick={() => api.deleteClient(client.id).then(fetchData)}>Delete</button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </>
        )
  }

  return (
    <div id="managementView" className="management-panel">
      {adminContent}
    </div>
  );
};

export default ManagementView;