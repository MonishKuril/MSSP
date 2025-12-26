const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const winston = require('winston');
const authRoutes = require('./routes/auth');
const clientsRoutes = require('./routes/clients');
const adminRoutes = require('./routes/admin');
const newsRoutes = require('./routes/news');
const { authMiddleware } = require('./middleware/auth');
require('dotenv').config();

// Logger configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

const app = express();
const PORT = process.env.PORT || 7000;

app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser(process.env.SESSION_SECRET));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', authMiddleware, clientsRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/news', newsRoutes);

// Serve React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
