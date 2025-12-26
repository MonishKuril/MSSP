const express = require('express');
const router = express.Router();
const http = require('http');
const fetch = require('node-fetch');
const { authMiddleware } = require('../middleware/auth');
const knex = require('../db');
const NodeCache = require('node-cache');

// Cache with a 60-second TTL
const dataCache = new NodeCache({ stdTTL: 30 });

router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'superadmin' || req.user.role === 'main-superadmin') {
      const clients = await knex('clients').select('*');
      return res.json(clients);
    }
    
    const user = await knex('users').where({ username: req.user.username }).first();
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    // Correctly fetch clients using the client_admins join table
    const adminClients = await knex('clients')
      .join('client_admins', 'clients.id', '=', 'client_admins.client_id')
      .where('client_admins.user_id', user.id)
      .select('clients.*');
      
    res.json(adminClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch clients' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const client = await knex('clients').where({ id: parseInt(req.params.id) }).first();
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    if (req.user.role === 'admin') {
        const user = await knex('users').where({ username: req.user.username }).first();
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (client.admin_id !== user.id) {
            return res.status(403).json({ success: false, message: 'You are not authorized to view this client' });
        }
    }
    
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch client' });
  }
});

router.get('/:id/logs', authMiddleware, async (req, res) => {
  const clientId = parseInt(req.params.id);
  const cacheKey = `logs-${clientId}`;

  try {
    const cachedData = dataCache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const client = await knex('clients').where({ id: clientId }).first();
    
    if (!client || !client.graylog_host) {
      return res.status(404).json({ success: false, message: 'Client or Graylog config not found' });
    }
    
    const fromDate = new Date();
    fromDate.setSeconds(fromDate.getSeconds() - 10); // 10 seconds ago
    const toDate = new Date(); // now
    
    const fromFormatted = fromDate.toISOString();
    const toFormatted = toDate.toISOString();
    
    const apiUrl = `http://${client.graylog_host}/api/search/universal/absolute?query=*&from=${fromFormatted}&to=${toFormatted}&limit=0&filter=streams:${client.graylog_stream_id}`;
    
    const auth = Buffer.from(`${client.graylog_username}:${client.graylog_password}`).toString('base64');
    
    const requestOptions = {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    };
    
    const fetchGraylogData = () => {
      return new Promise((resolve, reject) => {
        const req = http.get(apiUrl, requestOptions, (response) => {
          let data = '';
          response.on('data', (chunk) => { data += chunk; });
          response.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error('Failed to parse Graylog response'));
            }
          });
        });
        req.on('error', (err) => { reject(err); });
        req.end();
      });
    };
    
    const graylogResponse = await fetchGraylogData();
    
    const responseData = {
      success: true,
      clientId: client.id,
      clientName: client.name,
      logCount: graylogResponse.total_results || 0,
      timeRange: {
        from: fromFormatted,
        to: toFormatted
      }
    };
    
    dataCache.set(cacheKey, responseData);
    res.json(responseData);
    
  } catch (error) {
    console.error('Error fetching Graylog data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch log data' });
  }
});

router.get('/:id/logstats', authMiddleware, async (req, res) => {
  const clientId = parseInt(req.params.id);
  const cacheKey = `logstats-${clientId}`;

  try {
    const cachedData = dataCache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const client = await knex('clients').where({ id: clientId }).first();
    
    if (!client || !client.log_api_host) {
      return res.status(404).json({ success: false, message: 'Client or Log API config not found' });
    }

    const tokenResponse = await fetch(`http://${client.log_api_host}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: client.log_api_username,
        password: client.log_api_password
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.token) {
      throw new Error('Failed to get authentication token');
    }

    const statsResponse = await fetch(`http://${client.log_api_host}/api/logs/stats/overview?timeRange=24h`, {
      headers: {
        'Authorization': `Bearer ${tokenData.token}`,
        'Content-Type': 'application/json'
      }
    });

    const statsData = await statsResponse.json();
    const responseData = {
      success: true,
      stats: statsData
    };

    dataCache.set(cacheKey, responseData);
    res.json(responseData);
    
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch log statistics' });
  }
});

module.exports = router;