const mongoose = require('mongoose');

// Helper to Map string types to Mongoose types
const typeMapping = {
    'String': String,
    'Number': Number,
    'Boolean': Boolean,
    'Date': Date,
    'ObjectId': mongoose.Schema.Types.ObjectId
};

const createDynamicModel = (modelName, schemaDefinition) => {
    const schemaObj = {};

    // 1. Build the schema from definition
    for (const [key, config] of Object.entries(schemaDefinition)) {
        const fieldDef = {
            type: typeMapping[config.type] || String,
            required: config.required || false,
            default: config.default,
            unique: config.unique || false
        };

        // Number validations
        if (config.type === 'Number') {
            if (config.min !== undefined) fieldDef.min = config.min;
            if (config.max !== undefined) fieldDef.max = config.max;
        }

        // String validations
        if (config.type === 'String') {
            if (config.minLength !== undefined) fieldDef.minlength = config.minLength;
            if (config.maxLength !== undefined) fieldDef.maxlength = config.maxLength;
            if (config.options) fieldDef.enum = config.options;
        }

        schemaObj[key] = fieldDef;
    }

    // 2. Add Soft Delete fields
    schemaObj.isDeleted = { type: Boolean, default: false };
    schemaObj.deletedAt = { type: Date, default: null };

    const schema = new mongoose.Schema(schemaObj, { timestamps: true });

    // 3. Middlewares can be added here if needed (e.g. pre-save)

    return mongoose.model(modelName, schema);
};

module.exports = createDynamicModel;
