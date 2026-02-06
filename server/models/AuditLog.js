const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    entity: { type: String, required: true }, // e.g., 'Product'
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    action: { type: String, required: true, enum: ['CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE'] },
    changes: { type: Object }, // Stores before/after or just the changes
    timestamp: { type: Date, default: Date.now },
    performedBy: { type: String, default: 'System' } // Could be 'User ID' if auth was implemented
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
