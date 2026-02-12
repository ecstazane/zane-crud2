const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const modelConfig = require('./config/models');
const createDynamicModel = require('./models/DynamicModel');
const dynamicRoutes = require('./routes/dynamicRoutes');
const AuditLog = require('./models/AuditLog');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// 1. Initialize Database
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crud-zane2';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✓ MongoDB connected'))
    .catch(err => console.error('✕ MongoDB connection error:', err));

// 2. Initialize Dynamic Models
const initializedModels = {};
console.log('Initializing Models:');
Object.keys(modelConfig).forEach(modelName => {
    initializedModels[modelName] = createDynamicModel(modelName, modelConfig[modelName]);
    console.log(` - ${modelName}`);
});

// 3. Inject models into router
dynamicRoutes.initModels(initializedModels);

// 4. API Routes
app.get('/', (req, res) => {
    res.send('API is available at /api');
});

app.get('/api/config/models', (req, res) => {
    res.json(modelConfig);
});

app.get('/api/admin/audit-logs', async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/audit-logs/batch-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'IDs array is required' });
        }

        const result = await AuditLog.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Audit logs deleted', count: result.deletedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.use('/api', dynamicRoutes);

app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
});
